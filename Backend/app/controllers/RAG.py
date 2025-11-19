import json
import os
from neo4j import GraphDatabase
from dotenv import load_dotenv
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import google.generativeai as genai

load_dotenv()
URI = os.getenv("NEO4J_URI")
USER = os.getenv("NEO4J_USER")
PASS = os.getenv("NEO4J_PASSWORD")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)
    print("Gemini API configured.")
else:
    print("Warning: GEMINI_API_KEY not found in .env file. API calls will fail.")

try:
    driver = GraphDatabase.driver(URI, auth=(USER, PASS))
    driver.verify_connectivity()
    print("Neo4j connection successful.")
except Exception as e:
    print(f"Error: Could not connect to Neo4j. {e}")
    driver = None

try:
    print("Loading sentence-transformer model...")
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

    ROOT = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(ROOT, "dkb_embeddings.json")

    print(f"Loading DKB embeddings from {json_path}...")
    with open(json_path, "r") as f:
        dkb_data = json.load(f)

    dkb_concepts = dkb_data['concepts']
    dkb_embeddings_matrix = np.array(dkb_data['embeddings'])

    print(f"Successfully loaded {len(dkb_concepts)} DKB concepts.")

except FileNotFoundError:
    print("Error: dkb_embeddings.json not found.")
    print("Expected path:", json_path)
    dkb_concepts = None



# def _stage_1_mapper_embedding(nlp_json: dict) -> dict:
#     print("[Stage 1] Mapping NLP output using Semantic Search...")
    
#     MIN_SIMILARITY_THRESHOLD = 0.5
    
#     mapped_inputs = {"nfrs": set(), "constraints": set(), "domains": set()}
    
#     texts_to_map = []
#     if nlp_json.get("summary"):
#         texts_to_map.append(nlp_json["summary"])

#     for fr in nlp_json.get("functional_requirements", []):
#         if fr.get("text"):
#             texts_to_map.append(fr["text"])
        
#     for nfr in nlp_json.get("non_functional_requirements", []):
#         if nfr.get("text"):
#             texts_to_map.append(nfr["text"])
            
#     for con in nlp_json.get("constraints", []):
#         if con.get("text"):
#             texts_to_map.append(con["text"])
            
#     if not texts_to_map:
#         return {k: list(v) for k, v in mapped_inputs.items()}

#     user_embeddings = embedding_model.encode(texts_to_map)

#     similarity_matrix = cosine_similarity(user_embeddings, dkb_embeddings_matrix)

#     for i, user_snippet in enumerate(texts_to_map):
#         best_match_index = np.argmax(similarity_matrix[i])
#         best_match_score = similarity_matrix[i][best_match_index]
        
#         if best_match_score >= MIN_SIMILARITY_THRESHOLD:
#             matched_concept = dkb_concepts[best_match_index]
            
#             concept_name = matched_concept["name"]
#             concept_label = matched_concept["label"].lower() 
            
#             if concept_label in mapped_inputs:
#                 print(f"  [Match] '{user_snippet[:30]}...' -> {concept_label.upper()}: {concept_name} (Score: {best_match_score:.2f})")
#                 mapped_inputs[concept_label].add(concept_name)
    
#     final_map = {k: list(v) for k, v in mapped_inputs.items()}
#     print(f"[Stage 1] Mapped inputs: {final_map}")
#     return final_map


def _stage_1_mapper_embedding(nlp_json: dict) -> dict:
    print("\n[Stage 1] Starting Hybrid Mapping (Vector + Keyword)...")
    
    # 1. LOWER THRESHOLD significantly for testing
    MIN_SIMILARITY_THRESHOLD = 0.25 
    
    # 2. ROBUST MAPPING (Map your DKB labels to the 3 output keys)
    LABEL_MAPPING = {
        "nfr": "nfrs",
        "quality_attribute": "nfrs",
        "quality": "nfrs",
        "constraint": "constraints",
        "technical_constraint": "constraints",
        "domain": "domains",
        "industry": "domains",
        "system_type": "domains"
    }

    mapped_inputs = {"nfrs": set(), "constraints": set(), "domains": set()}
    
    # Gather text to analyze
    texts_to_map = []
    if nlp_json.get("summary"): texts_to_map.append(nlp_json["summary"])
    for fr in nlp_json.get("functional_requirements", []):
        if fr.get("text"): texts_to_map.append(fr["text"])
    for nfr in nlp_json.get("non_functional_requirements", []):
        if nfr.get("text"): texts_to_map.append(nfr["text"])
    for con in nlp_json.get("constraints", []):
        if con.get("text"): texts_to_map.append(con["text"])

    if not texts_to_map:
        print("No text found in NLP output to map.")
        return {k: list(v) for k, v in mapped_inputs.items()}

    # --- STRATEGY A: Exact Keyword Match (The Safety Net) ---
    print(f"Scanning {len(texts_to_map)} text snippets against {len(dkb_concepts)} concepts...")
    
    for concept in dkb_concepts:
        c_name = concept["name"].lower()
        c_label = concept.get("label", "").lower()
        target_bucket = LABEL_MAPPING.get(c_label)
        
        if target_bucket:
            for text in texts_to_map:
                # specific check: is the concept name inside the user text?
                if c_name in text.lower(): 
                    print(f"  [Keyword Match] Found '{c_name}' in text.")
                    mapped_inputs[target_bucket].add(concept["name"])

    # --- STRATEGY B: Semantic Vector Search ---
    user_embeddings = embedding_model.encode(texts_to_map)
    similarity_matrix = cosine_similarity(user_embeddings, dkb_embeddings_matrix)

    for i, text in enumerate(texts_to_map):
        # Get top 3 matches for this sentence to see what's going on
        top_3_indices = np.argsort(similarity_matrix[i])[-3:][::-1]
        
        print(f"\nAnalyzing snippet: '{text[:40]}...'")
        
        for idx in top_3_indices:
            score = similarity_matrix[i][idx]
            concept = dkb_concepts[idx]
            name = concept["name"]
            label = concept.get("label", "").lower()
            
            # Debug Print: Show us what the model THINKS is similar
            print(f"   - Candidate: {name} ({label}) | Score: {score:.4f}")

            if score >= MIN_SIMILARITY_THRESHOLD:
                target_bucket = LABEL_MAPPING.get(label)
                if target_bucket:
                    mapped_inputs[target_bucket].add(name)
                    print(f"     -> ADDED to {target_bucket}")

    final_map = {k: list(v) for k, v in mapped_inputs.items()}
    print(f"\n[Stage 1] Final Mapped inputs: {final_map}")
    return final_map

def _stage_2_dkb_query(session, mapped_inputs: dict) -> dict:
    print("[Stage 2] DKB Query running (Weighted Scoring Strategy)...")
    
    nfrs = mapped_inputs.get("nfrs", [])
    constraints = mapped_inputs.get("constraints", [])
    domains = mapped_inputs.get("domains", [])
    
    # FIX: This query calculates a score instead of filtering out options.
    # It rewards matches (+ points) and penalizes conflicts (- points).
    ranking_query = """
    WITH $nfrs AS nfrs, $constraints AS constraints, $domains AS domains
    MATCH (p:Pattern)
    WITH p, p.cost AS baseCost, nfrs, constraints, domains

    // 1. Score NFRs (Promotes = +2, Hinders = -5)
    OPTIONAL MATCH (p)-[:PROMOTES]->(n:NFR) WHERE n.name IN nfrs
    WITH p, baseCost, nfrs, constraints, domains, count(n) * 2 AS promoteScore

    OPTIONAL MATCH (p)-[:HINDERS]->(n:NFR) WHERE n.name IN nfrs
    WITH p, baseCost, nfrs, constraints, domains, promoteScore, count(n) * 5 AS hinderScore

    // 2. Score Domains (+1 point)
    OPTIONAL MATCH (p)-[:SUITS]->(d:Domain) WHERE d.name IN domains
    WITH p, baseCost, nfrs, constraints, domains, promoteScore, hinderScore, count(d) AS domainScore
         
    // 3. Score Constraints (+3 points for meeting a constraint)
    // We removed the strict 'WHERE' clause. Now we just add to the score.
    OPTIONAL MATCH (p)-[:MEETS_CONSTRAINT]->(c:Constraint) WHERE c.name IN constraints
    WITH p, baseCost, promoteScore, hinderScore, domainScore, count(c) * 3 AS constraintScore

    // Calculate Final Fit Score
    // Formula: (Benefits) - (Drawbacks)
    WITH p, baseCost, (promoteScore + domainScore + constraintScore - hinderScore) AS fitScore

    RETURN 
        p.name AS pattern, 
        p.description AS description,
        fitScore,
        baseCost
    
    // Order by Fit Score first (Highest wins). 
    // If scores are tied, cheaper implementation wins (baseCost ASC).
    ORDER BY fitScore DESC, baseCost ASC
    """
    
    parameters = {"nfrs": nfrs, "constraints": constraints, "domains": domains}
    result = session.run(ranking_query, parameters)
    ranked_patterns = [record.data() for record in result]

    # Debug Print: Show the top candidates and their scores
    if ranked_patterns:
        print(f"  [Ranking] Top 3 Candidates:")
        for i, r in enumerate(ranked_patterns[:3]):
            print(f"    {i+1}. {r['pattern']} (Score: {r['fitScore']}, Cost: {r['baseCost']})")
    else:
        print("[Stage 2] No patterns found in database (Graph might be empty).")
        return {"ranked_patterns": [], "top_choice_stack": None}

    top_pattern_name = ranked_patterns[0]["pattern"]
    tech_stack = _get_tech_stack_for_pattern(session, top_pattern_name)
    
    print(f"[Stage 2] Top choice identified: {top_pattern_name}")
    
    return {
        "ranked_patterns": ranked_patterns,
        "top_choice_stack": {
            "pattern": top_pattern_name,
            "components": tech_stack
        }
    }

def _get_tech_stack_for_pattern(session, pattern_name: str) -> dict:
    query = """
    MATCH (p:Pattern {name: $pattern_name})-[:REQUIRES]->(ct:ComponentType)
    OPTIONAL MATCH (ct)<-[:IS_A]-(c:Component)
    RETURN ct.name AS component_type, 
           collect({
             name: c.name, 
             license: c.license, 
             cost_model: c.cost_model, 
             tags: c.tags
           }) AS alternatives
    """
    result = session.run(query, {"pattern_name": pattern_name})
    
    tech_stack = {}
    for record in result:
        tech_stack[record["component_type"]] = record["alternatives"]
        
    return tech_stack


def stage_3_call_gemini_api(nlp_json: dict, dkb_results: dict) -> str:
    print("[Stage 3] Calling Gemini API for synthesis...")
    
    if not GEMINI_KEY:
        return "Error: GEMINI_API_KEY is not set. Cannot call the API."

    try:
        model = genai.GenerativeModel('gemini-2.0-flash') 
    except Exception as e:
        print(f"Error initializing Gemini model: {e}")
        return f"Error: Could not initialize Gemini model. {e}"

    nlp_json_str = json.dumps(nlp_json, indent=2)
    dkb_results_str = json.dumps(dkb_results, indent=2)

    final_prompt_to_gemini = f"""
You are an expert full-stack solution architect.
Your task is to produce a clear, comprehensive, professional architectural proposal based strictly on the three data sources provided:
User’s Query - "{nlp_json.get('raw_input', nlp_json.get('summary', ''))}"
NLP Analysis (What the system must do) - {nlp_json_str}
DKB Analysis (How to build the system) - {dkb_results_str}
You must use the content from these sources to form your architectural plan.
You must not explicitly reference these sources or say phrases like “based on the NLP analysis” or “according to the DKB.”
The final output must read as a polished architecture document, not an explanation of how you derived it.

📌 Output Format (Must Follow This Structure Exactly)
Executive Summary
Provide a concise, stakeholder-friendly overview of:
The system being proposed
The recommended architectural pattern (e.g., Event-Driven Microservices, Modular Monolith, Serverless, etc.)
The primary reasons this pattern is the best fit (based on critical NFRs like scalability, performance, cost efficiency, security, or latency)

1. Project Overview
Summarize the full scope of the system:
Core functionality
Users & actors
Main workflows
High-level goals
Business value

2. Functional Requirements
List all functional requirements extracted from the NLP data:
Use bullet points
Group by modules if applicable (e.g., Authentication, Payments, Search, Dashboard, Admin Panel, etc.)

3. Non-Functional Requirements (NFRs)
List all NFRs and constraints such as:
Scalability
Performance
Latency
Security & compliance
Availability
Reliability
Extensibility
Cost constraints
Each NFR must clearly guide architectural choices later in the report.

4. Constraints & Solution Approaches
For every constraint found in the NLP data, provide:
A clear explanation of the constraint
The recommended solution or workaround
Relevant technology implications
Examples:
“Must run on AWS” → use AWS-native compute/storage/networking
“Must integrate with Stripe” → use a dedicated Payments module with Stripe SDK
“Low cost requirement” → prefer serverless or managed services

5. Architectural Pattern & Style
Provide the recommended architecture and justify why it is the optimal choice.
Include:
Architectural pattern (e.g., Microservices, Event-Driven, Modular Monolith, Serverless)
Architectural style (REST, GraphQL, CQRS, Event Sourcing, Layered Architecture, Hexagonal Architecture, etc.)
Major reasons why this pattern fits the NFRs and constraints
Key trade-offs versus other architectural patterns
Do not mention pattern rankings or “fitScores.” Instead, justify the decision naturally.

6. High-Level System Architecture
Describe the end-to-end system including:
Main components and services
Their responsibilities
How they communicate
Internal modules
Data flow between entities (from the NLP data)
External integrations
Infrastructure layers
This section should read like a conceptual architecture document.

7. Technology Stack Recommendation
For each component category listed in the DKB (e.g., API layer, DB, cache, message broker, compute layer, identity provider, observability, CI/CD), choose one technology from the DKB alternatives.
For each chosen technology:
Justify the choice referencing its strengths (e.g., tags like scalable, GDPR-compliant, cost-efficient, high-throughput)
Consider licensing model, cost model, or cloud compatibility when relevant
Ensure the tech aligns with constraints (e.g., AWS, Stripe, required programming languages)
This section must deliver a ready-to-implement technology roadmap.

8. Data Storage & Management
Specify:
Databases (SQL/NoSQL)
Caching mechanisms
Event storage (if applicable)
Data retention & governance
Backup & disaster recovery approach
Justify choices based on NFRs such as speed, durability, or consistency requirements.

9. Integration & Third-Party Services
List all external systems from the NLP analysis and provide:
Integration purpose
Method (REST, GraphQL, Webhooks, SDK, Messages)
Reliability and fallback strategies

10. Security & Compliance
Provide a detailed, practical security plan:
Authentication & authorization
API security
Data encryption
Secrets and key management
Compliance requirements (GDPR, PCI, ISO, etc. — only if present in the data sources)

11. Deployment & DevOps Strategy
Outline:
CI/CD pipelines
Infrastructure-as-Code
Deployment strategy (blue-green, rolling updates, canary)
Environment setup (dev, staging, prod)
Monitoring, logging, tracing
Autoscaling strategy

12. Final Justification
Provide a powerful concluding section summarizing:
Why this architecture is the most suitable option
How it satisfies functional & non-functional requirements
How it meets all constraints
Long-term maintainability and extensibility benefits
Do not reference the NLP or DKB stages.
Do not explain how the system picked the architecture.
Deliver the conclusion as if presenting to a CTO or lead engineer.

🎯 Hard Rules
Do NOT mention NLP, DKB, fitScores, rankings, or metadata.
Do NOT break the structure.
Do NOT hallucinate. Use only details found in the three data sources.
Use polished technical language appropriate for senior architects.
The output should feel like a real consulting report.

"""

    try:
        response = model.generate_content(final_prompt_to_gemini)
        return response.text
    except Exception as e:
        print(f"Error during Gemini API call: {e}")
        return f"Error: The API call to Gemini failed. {e}"


def get_architecture_recommendation(nlp_json_input: dict) -> str:
    if driver is None or dkb_concepts is None:
        return "Error: System is not initialized. Check Neo4j connection and 'dkb_embeddings.json' file."
        
    print(f"\n===== New Request: '{nlp_json_input.get('summary', 'N/A')}' =====")
    
    mapped_inputs = _stage_1_mapper_embedding(nlp_json_input)
    
    with driver.session() as session:
        dkb_results = _stage_2_dkb_query(session, mapped_inputs)
    
    if not dkb_results["ranked_patterns"]:
        return "I'm sorry, but no architectural patterns in our knowledge base fit your specific constraints. You may need to relax some of your requirements."
        
    final_answer = stage_3_call_gemini_api(
        nlp_json=nlp_json_input,
        dkb_results=dkb_results
    )
    
    return final_answer

