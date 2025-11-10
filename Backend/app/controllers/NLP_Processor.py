import spacy
from typing import List, Dict, Any, Tuple
import re
from collections import defaultdict
from models.requirements_model import (
    RequirementsAnalysisOutput,
    FunctionalRequirement,
    NonFunctionalRequirement,
    Constraint,
    Entity,
    Relationship,
    BusinessRule
)

class NLPProcessor:
    def __init__(self):
        """Initialize the NLP processor with spaCy model"""
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Downloading spaCy model...")
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
            self.nlp = spacy.load("en_core_web_sm")
        
        # Define patterns for requirement types
        self.nfr_patterns = {
            "performance": ["latency", "response time", "throughput", "speed", "fast", "milliseconds", "seconds", "performance"],
            "scalability": ["concurrent", "scale", "load", "traffic", "requests per second", "rps", "capacity"],
            "security": ["secure", "encryption", "authentication", "authorization", "ssl", "tls", "gdpr", "compliance", "security"],
            "availability": ["uptime", "available", "24/7", "downtime", "reliability", "sla", "availability"],
            "usability": ["user-friendly", "intuitive", "easy to use", "ux", "ui", "usability"],
            "maintainability": ["maintainable", "modular", "extensible", "upgradable", "maintainability"],
            "portability": ["cross-platform", "mobile", "web", "desktop", "portability"]
        }
        
        self.constraint_keywords = {
            "technology": ["must use", "built with", "using", "powered by", "based on"],
            "compliance": ["comply", "compliant", "gdpr", "hipaa", "pci", "regulation", "standard"],
            "deployment": ["deploy", "deployed", "host", "hosted"]
        }
        
        self.relationship_verbs = {
            "requests": ["request", "ask for", "order", "book"],
            "manages": ["manage", "control", "administer", "supervise"],
            "processes": ["process", "handle", "execute", "perform"],
            "contains": ["contain", "include", "have", "consist of"],
            "uses": ["use", "utilize", "employ"],
            "creates": ["create", "generate", "produce", "add"],
            "views": ["view", "see", "display", "show", "browse"],
            "accepts": ["accept", "receive", "take"],
            "rates": ["rate", "review", "evaluate"]
        }
        
        self.action_verbs = ["request", "accept", "view", "create", "delete", "update", "add", 
                            "remove", "send", "receive", "book", "cancel", "rate", "review",
                            "search", "filter", "browse", "select", "submit", "approve", "reject"]

    def analyze_requirements(self, requirements_text: str, context: str = None) -> RequirementsAnalysisOutput:
        """
        Main method to analyze requirements text and extract structured information
        """
        doc = self.nlp(requirements_text)
        
        # Extract different components
        summary = self._generate_summary(requirements_text, doc)
        functional_reqs = self._extract_functional_requirements(doc, requirements_text)
        non_functional_reqs = self._extract_non_functional_requirements(doc, requirements_text)
        constraints = self._extract_constraints(doc, requirements_text)
        actors = self._extract_actors(doc)
        entities = self._extract_entities(doc)
        relationships = self._extract_relationships(doc, actors, entities)
        business_rules = self._extract_business_rules(doc, requirements_text)
        technologies = self._extract_technologies(doc, requirements_text)
        confidence = self._calculate_confidence(doc, functional_reqs, non_functional_reqs)
        
        return RequirementsAnalysisOutput(
            summary=summary,
            functional_requirements=functional_reqs,
            non_functional_requirements=non_functional_reqs,
            constraints=constraints,
            actors=actors,
            entities=entities,
            relationships=relationships,
            business_rules=business_rules,
            technologies_mentioned=technologies,
            confidence=confidence,
            raw_input=requirements_text
        )

    def _generate_summary(self, text: str, doc) -> str:
        """Generate a concise summary of the requirements"""
        sentences = [sent.text.strip() for sent in doc.sents]
        
        # Take first sentence and key points
        summary_parts = []
        if sentences:
            summary_parts.append(sentences[0])
        
        # Add key technologies, constraints
        tech_mentions = []
        for token in doc:
            if token.pos_ == "PROPN" and token.text.lower() in ["aws", "stripe", "gdpr", "azure", "gcp"]:
                tech_mentions.append(token.text)
        
        if tech_mentions:
            summary_parts.append(", ".join(set(tech_mentions)))
        
        return ". ".join(summary_parts)[:200]

    def _extract_functional_requirements(self, doc, text: str) -> List[FunctionalRequirement]:
        """Extract functional requirements (what the system should do)"""
        functional_reqs = []
        sentences = [sent.text.strip() for sent in doc.sents]
        
        functional_keywords = ["can", "should", "shall", "will", "able to", "allow", "enable", "provide"]
        
        for sent in sentences:
            sent_lower = sent.lower()
            sent_doc = self.nlp(sent)
            
            has_functional_keyword = any(keyword in sent_lower for keyword in functional_keywords)
            has_action_verb = any(token.lemma_ in self.action_verbs for token in sent_doc if token.pos_ == "VERB")
            
            is_nfr = self._has_nfr_with_metric(sent_lower)
            is_strong_constraint = self._is_strong_constraint(sent_lower)
            
            if (has_functional_keyword or has_action_verb) and not is_nfr and not is_strong_constraint:
                functional_reqs.append(FunctionalRequirement(
                    id=f"FR{len(functional_reqs) + 1}",
                    text=sent,
                    priority=self._determine_priority(sent)
                ))
        
        return functional_reqs

    def _extract_non_functional_requirements(self, doc, text: str) -> List[NonFunctionalRequirement]:
        """Extract non-functional requirements (quality attributes)"""
        nfr_list = []
        sentences = [sent.text.strip() for sent in doc.sents]
        
        for sent in sentences:
            sent_lower = sent.lower()
            
            if self._is_strong_constraint(sent_lower):
                continue
            
            matched_category = None
            for category, keywords in self.nfr_patterns.items():
                if any(keyword in sent_lower for keyword in keywords):
                    matched_category = category
                    break
            
            if matched_category:
                value, unit = self._extract_numeric_value(sent)
                
                nfr_list.append(NonFunctionalRequirement(
                    id=f"NFR{len(nfr_list) + 1}",
                    text=sent,
                    category=matched_category,
                    value=value,
                    unit=unit,
                    priority=self._determine_priority(sent)
                ))
        
        return nfr_list

    def _extract_constraints(self, doc, text: str) -> List[Constraint]:
        """Extract system constraints"""
        constraints = []
        sentences = [sent.text.strip() for sent in doc.sents]
        
        for sent in sentences:
            sent_lower = sent.lower()
            
            matched = False
            for constraint_type, keywords in self.constraint_keywords.items():
                if any(keyword in sent_lower for keyword in keywords):
                    value = self._extract_constraint_value(sent, constraint_type)
                    
                    if value and len(value) > 2 and not value.startswith(sent[:20]):
                        constraints.append(Constraint(
                            id=f"C{len(constraints) + 1}",
                            text=sent,
                            type=constraint_type,
                            value=value,
                            mandatory="must" in sent_lower or "required" in sent_lower
                        ))
                        matched = True
                        break
            
            if not matched and ("comply" in sent_lower or "compliant" in sent_lower):
                compliance_value = self._extract_constraint_value(sent, "compliance")
                if compliance_value:
                    constraints.append(Constraint(
                        id=f"C{len(constraints) + 1}",
                        text=sent,
                        type="compliance",
                        value=compliance_value,
                        mandatory="must" in sent_lower or "required" in sent_lower
                    ))
        
        return constraints

    def _extract_actors(self, doc) -> List[str]:
        """Extract actors/users from the text"""
        actors = set()
        
        # Look for persons, roles
        for ent in doc.ents:
            if ent.label_ in ["PERSON", "ORG", "NORP"]:
                actors.add(ent.text)
        
        # Look for common role keywords
        role_keywords = ["user", "admin", "customer", "driver", "manager", "client", "seller", 
                        "buyer", "guest", "member", "owner", "operator", "employee", "staff"]
        
        for token in doc:
            token_lower = token.text.lower()
            if token_lower in role_keywords:
                actors.add(token.text.capitalize())
            
            if token_lower.endswith('s') and token_lower[:-1] in role_keywords:
                actors.add(token_lower[:-1].capitalize())
        
        # Add common technical actors
        tech_actors = ["PaymentGateway", "NotificationService", "Database"]
        for sentence in doc.sents:
            sent_lower = sentence.text.lower()
            if ("payment" in sent_lower or "stripe" in sent_lower or "paypal" in sent_lower) and \
               any(word in sent_lower for word in ["process", "gateway", "service"]):
                actors.add("PaymentGateway")
            if "notification" in sent_lower or "email" in sent_lower:
                actors.add("NotificationService")
        
        return sorted(list(actors))

    def _extract_entities(self, doc) -> List[Entity]:
        """Extract domain entities"""
        entities = []
        entity_dict = defaultdict(set)
        
        domain_keywords = ["ride", "user", "driver", "order", "payment", "booking", "product", 
                          "service", "account", "profile", "reservation", "transaction", 
                          "request", "review", "rating", "history"]
        
        excluded_entities = ["application", "system", "latency", "processing", "matching"]
        
        # Extract nouns as potential entities
        for chunk in doc.noun_chunks:
            # Filter out common words
            if chunk.root.pos_ == "NOUN":
                entity_name = chunk.root.text.lower()
                
                if entity_name in excluded_entities:
                    continue
                
                if entity_name in domain_keywords or entity_name.rstrip('s') in domain_keywords:
                    attributes = []
                    for token in chunk:
                        if token.pos_ == "ADJ" and token.text.lower() not in ["concurrent", "intercity"]:
                            attributes.append(token.text.lower())
                        elif token.pos_ == "NOUN" and token != chunk.root and token.text.lower() not in excluded_entities:
                            attributes.append(token.text.lower())
                    
                    final_name = entity_name[:-1] if entity_name.endswith('s') and entity_name[:-1] in domain_keywords else entity_name
                    entity_dict[final_name.capitalize()].update(attributes)
        
        # Convert to Entity objects
        for entity_name, attributes in entity_dict.items():
            entities.append(Entity(
                name=entity_name,
                type="domain_entity",
                attributes=list(attributes) if attributes else []
            ))
        
        return entities[:10]  # Limit to top 10 entities

    def _extract_relationships(self, doc, actors: List[str], entities: List[Entity]) -> List[Relationship]:
        """Extract relationships between actors and entities"""
        relationships = []
        entity_names = [e.name for e in entities]
        
        actors_lower = {a.lower(): a for a in actors}
        entities_lower = {e.lower(): e for e in entity_names}
        all_subjects_lower = {**actors_lower, **entities_lower}
        
        for sent in doc.sents:
            for token in sent:
                if token.pos_ == "VERB":
                    # Find subject and object
                    subject = None
                    obj = None
                    
                    for child in token.children:
                        if child.dep_ in ["nsubj", "nsubjpass"]:
                            child_lower = child.text.lower()
                            if child_lower in all_subjects_lower:
                                subject = all_subjects_lower[child_lower]
                            elif child_lower.endswith('s') and child_lower[:-1] in all_subjects_lower:
                                subject = all_subjects_lower[child_lower[:-1]]
                        
                        elif child.dep_ in ["dobj", "pobj", "attr"]:
                            child_lower = child.text.lower()
                            if child_lower in all_subjects_lower:
                                obj = all_subjects_lower[child_lower]
                            elif child_lower.endswith('s') and child_lower[:-1] in all_subjects_lower:
                                obj = all_subjects_lower[child_lower[:-1]]
                    
                    if subject and obj and subject != obj:
                        rel_type = self._determine_relationship_type(token.lemma_)
                        relationships.append(Relationship(
                            source=subject,
                            target=obj,
                            type=rel_type
                        ))
        
        return relationships[:15]  # Limit relationships

    def _extract_business_rules(self, doc, text: str) -> List[BusinessRule]:
        """Extract business rules"""
        rules = []
        sentences = [sent.text.strip() for sent in doc.sents]
        
        rule_indicators = ["if", "when", "only", "rule", "policy", "unless", "except", "condition"]
        
        for sent in sentences:
            sent_lower = sent.lower()
            has_rule_indicator = any(f" {indicator} " in f" {sent_lower} " or sent_lower.startswith(indicator + " ") 
                                    for indicator in rule_indicators)
            
            is_strong_constraint = self._is_strong_constraint(sent_lower)
            
            if has_rule_indicator and not is_strong_constraint:
                rules.append(BusinessRule(
                    id=f"BR{len(rules) + 1}",
                    text=sent,
                    category="business_logic"
                ))
        
        return rules

    def _extract_technologies(self, doc, text: str) -> List[str]:
        """Extract mentioned technologies"""
        technologies = set()
        tech_keywords = ["aws", "azure", "gcp", "stripe", "paypal", "react", "angular", "vue", 
                        "python", "java", "node", "docker", "kubernetes", "mysql", "postgresql", 
                        "mongodb", "redis", "kafka", "rabbitmq", "graphql", "rest"]
        
        for token in doc:
            if token.text.lower() in tech_keywords:
                technologies.add(token.text.upper() if token.text.lower() in ["aws", "gcp", "api"] else token.text.capitalize())
        
        return sorted(list(technologies))

    def _extract_numeric_value(self, text: str) -> Tuple[str, str]:
        """Extract numeric values and units from text"""
        # Match patterns like "10000 users", "200ms", "99.9%"
        patterns = [
            r'(\d+(?:,\d+)*(?:\.\d+)?)\s*(%|ms|seconds?|minutes?|hours?|days?|users?|requests?|rpm|qps)',
            r'(\d+(?:,\d+)*(?:\.\d+)?)\s*(concurrent(?:ly)?|simultaneous(?:ly)?)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                value = match.group(1).replace(',', '')
                unit = match.group(2) if len(match.groups()) > 1 else ""
                return value, unit
        
        return None, None

    def _extract_constraint_value(self, text: str, constraint_type: str) -> str:
        """Extract the specific value of a constraint"""
        text_lower = text.lower()
        
        if constraint_type == "technology":
            tech_names = ["stripe", "paypal", "aws", "azure", "gcp", "react", "angular", "vue", 
                         "python", "java", "node", "mysql", "postgresql", "mongodb"]
            for tech in tech_names:
                if tech in text_lower:
                    return tech.upper() if tech in ["aws", "gcp"] else tech.capitalize()
        
        elif constraint_type == "compliance":
            compliance_standards = ["gdpr", "hipaa", "pci", "sox", "iso"]
            for standard in compliance_standards:
                if standard in text_lower:
                    return standard.upper()
        
        elif constraint_type == "deployment":
            platforms = ["aws", "azure", "gcp", "heroku", "vercel", "netlify", "on-premise", "cloud"]
            for platform in platforms:
                if platform in text_lower:
                    return platform.upper() if platform in ["aws", "gcp"] else platform.capitalize()
        
        return None

    def _has_nfr_with_metric(self, text: str) -> bool:
        has_nfr_keyword = any(keyword in text for category in self.nfr_patterns.values() for keyword in category)
        has_metric = bool(re.search(r'\d+\s*(ms|seconds?|%|users?|concurrent)', text, re.IGNORECASE))
        return has_nfr_keyword and has_metric

    def _is_strong_constraint(self, text: str) -> bool:
        return any(keyword in text for keyword in ["must use", "deployed on", "built with", "powered by"]) or \
               (("comply" in text or "compliant" in text) and any(std in text for std in ["gdpr", "hipaa", "pci"]))

    def _is_constraint_sentence(self, text: str) -> bool:
        return self._is_strong_constraint(text)

    def _determine_priority(self, text: str) -> str:
        """Determine priority based on keywords"""
        text_lower = text.lower()
        if any(word in text_lower for word in ["critical", "must", "essential", "required", "shall"]):
            return "high"
        elif any(word in text_lower for word in ["should", "important"]):
            return "medium"
        else:
            return "low"

    def _determine_relationship_type(self, verb: str) -> str:
        """Determine relationship type from verb"""
        for rel_type, verbs in self.relationship_verbs.items():
            if verb in verbs:
                return rel_type
        return "interacts_with"

    def _calculate_confidence(self, doc, functional_reqs: List, non_functional_reqs: List) -> float:
        """Calculate confidence score based on extracted information quality"""
        score = 0.5  # Base score
        
        # Increase confidence based on extracted requirements
        if len(functional_reqs) > 0:
            score += 0.2
        if len(non_functional_reqs) > 0:
            score += 0.15
        
        # Increase based on text quality
        if len(doc) > 20:  # Sufficient detail
            score += 0.1
        
        # Check for clarity (presence of numbers, specific terms)
        if any(token.like_num for token in doc):
            score += 0.05
        
        return min(score, 1.0)