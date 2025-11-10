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

    print("Loading DKB embeddings from 'dkb_embeddings.json'...")
    with open('dkb_embeddings.json', 'r') as f:
        dkb_data = json.load(f)
    
    dkb_concepts = dkb_data['concepts'] 
    dkb_embeddings_matrix = np.array(dkb_data['embeddings'])
    
    print(f"Successfully loaded {len(dkb_concepts)} DKB concepts.")

except FileNotFoundError:
    print("Error: 'dkb_embeddings.json' not found.")
    print("Please run 'create_embeddings.py' first.")
    dkb_concepts = None
except Exception as e:
    print(f"Error loading embedding model or data: {e}")
    dkb_concepts = None


def _stage_1_mapper_embedding(nlp_json: dict) -> dict:
    """
    Uses semantic search (embeddings) to map NLP output
    to our DKB concepts.
    """
    print("[Stage 1] Mapping NLP output using Semantic Search...")
    
    # This is the minimum "score" to be considered a match.
    # (0.0 = no match, 1.0 = perfect match)
    # You can tune this value. 0.5 is a good start.
    MIN_SIMILARITY_THRESHOLD = 0.5
    
    mapped_inputs = {"nfrs": set(), "constraints": set(), "domains": set()}
    
    # 1. Collect all "raw text" from the user's requirements
    texts_to_map = []
    if nlp_json.get("summary"):
        texts_to_map.append(nlp_json["summary"])

    for fr in nlp_json.get("functional_requirements", []):
        if fr.get("text"):
            texts_to_map.append(fr["text"])
        
    for nfr in nlp_json.get("non_functional_requirements", []):
        if nfr.get("text"):
            texts_to_map.append(nfr["text"])
            
    for con in nlp_json.get("constraints", []):
        if con.get("text"):
            texts_to_map.append(con["text"])
            
    if not texts_to_map:
        return {k: list(v) for k, v in mapped_inputs.items()}

    # 2. Generate embeddings for all the user's text snippets
    user_embeddings = embedding_model.encode(texts_to_map)

    # 3. Perform semantic search
    # This computes the similarity between *every* user snippet
    # and *every* DKB concept in a single, fast operation.
    similarity_matrix = cosine_similarity(user_embeddings, dkb_embeddings_matrix)

    # 4. Find the best matches above our threshold
    for i, user_snippet in enumerate(texts_to_map):
        # Find the index of the highest-scoring DKB concept for this snippet
        best_match_index = np.argmax(similarity_matrix[i])
        best_match_score = similarity_matrix[i][best_match_index]
        
        if best_match_score >= MIN_SIMILARITY_THRESHOLD:
            matched_concept = dkb_concepts[best_match_index]
            
            concept_name = matched_concept["name"]
            concept_label = matched_concept["label"].lower() # "nfr", "constraint", "domain"
            
            # Add it to the correct list
            if concept_label in mapped_inputs:
                print(f"  [Match] '{user_snippet[:30]}...' -> {concept_label.upper()}: {concept_name} (Score: {best_match_score:.2f})")
                mapped_inputs[concept_label].add(concept_name)
    
    final_map = {k: list(v) for k, v in mapped_inputs.items()}
    print(f"[Stage 1] Mapped inputs: {final_map}")
    return final_map


# ======================================================================
# STAGE 2: DKB QUERY (NEO4J) - UNCHANGED
# ======================================================================

def _stage_2_dkb_query(session, mapped_inputs: dict) -> dict:
    """
    Runs the recommendation and tech-stack queries against the Neo4j DKB.
    (This function is UNCHANGED from the previous step)
    """
    print("[Stage 2] DKB Query running...")
    
    nfrs = mapped_inputs.get("nfrs", [])
    constraints = mapped_inputs.get("constraints", [])
    domains = mapped_inputs.get("domains", [])
    
    # --- Query 1: Rank Patterns (Now includes Domain scoring) ---
    ranking_query = """
    WITH $nfrs AS nfrs, $constraints AS constraints, $domains AS domains
    MATCH (p:Pattern)
    WITH p, p.cost AS baseCost, nfrs, constraints, domains

    // Score NFRs (+1 promote, -1 hinder)
    OPTIONAL MATCH (p)-[r_nfr:PROMOTES]->(n:NFR) WHERE n.name IN nfrs
    OPTIONAL MATCH (p)-[h_nfr:HINDERS]->(nfr_h:NFR) WHERE nfr_h.name IN nfrs
    WITH p, baseCost, nfrs, constraints, domains, 
         count(r_nfr) AS nfrScore, count(h_nfr) AS hindranceScore

    // Score Domains (+1 suits)
    OPTIONAL MATCH (p)-[r_dom:SUITS]->(d:Domain) WHERE d.name IN domains
    WITH p, baseCost, nfrs, constraints, domains, nfrScore, hindranceScore,
         count(r_dom) AS domainScore
         
    // Filter by Constraints (Must meet ALL)
    OPTIONAL MATCH (p)-[m:MEETS_CONSTRAINT]->(c:Constraint) WHERE c.name IN constraints
    WITH p, baseCost, nfrs, constraints, 
         (nfrScore - hindranceScore + domainScore) AS fitScore, 
         collect(c.name) AS metConstraints
    
    WHERE size(metConstraints) = size(constraints)

    // Order and return
    RETURN 
        p.name AS pattern, 
        p.description AS description,
        fitScore,
        baseCost
    ORDER BY fitScore DESC, baseCost ASC
    """
    
    parameters = {"nfrs": nfrs, "constraints": constraints, "domains": domains}
    result = session.run(ranking_query, parameters)
    ranked_patterns = [record.data() for record in result]

    if not ranked_patterns:
        print("[Stage 2] No patterns matched the strict constraints.")
        return {"ranked_patterns": [], "top_choice_stack": None}

    # --- Query 2: Get Tech Stack for Top Pattern ---
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
    """
    Helper function to get required components and their alternatives
    """
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

# ======================================================================
# STAGE 3: LLM SYNTHESIS (STUB) - UNCHANGED
# ======================================================================

def stage_3_call_gemini_api(nlp_json: dict, dkb_results: dict) -> str:
    """
    Calls the Gemini API to synthesize the final answer.
    """
    print("[Stage 3] Calling Gemini API for synthesis...")
    
    if not GEMINI_KEY:
        return "Error: GEMINI_API_KEY is not set. Cannot call the API."

    # Initialize the model
    # Use 'gemini-1.5-pro-latest' for the best results,
    # or 'gemini-pro' for a faster response.
    try:
        model = genai.GenerativeModel('gemini-2.5-pro') 
    except Exception as e:
        print(f"Error initializing Gemini model: {e}")
        return f"Error: Could not initialize Gemini model. {e}"

    # Convert all structured data to JSON strings for the prompt
    nlp_json_str = json.dumps(nlp_json, indent=2)
    dkb_results_str = json.dumps(dkb_results, indent=2)

    # --- This is the complete, detailed prompt ---
    final_prompt_to_gemini = f"""
You are an expert, full-stack solution architect. Your task is to provide a comprehensive, 
grounded, and professional architectural recommendation.

You **must** use the following three data sources to formulate your answer.
Do not hallucinate features or make decisions without grounding them in this data.

---
### 1. The User's Original Query
This is the original, high-level request from the user.

"{nlp_json.get('raw_input', nlp_json.get('summary', ''))}"

---
### 2. Stage 1: Structured NLP Analysis (The "What")
This is the detailed breakdown of the user's needs, extracted by our NLP system.
You must address all NFRs, Constraints, and Entities.

{nlp_json_str}

---
### 3. Stage 2: DKB Analysis (The "How")
This is the grounded data from our "Decision Engine" graph. It contains the
ranked patterns that fit the user's needs and their corresponding tech stacks.

{dkb_results_str}

---

### Your Task: Write the Architectural Proposal

You must generate a multi-section report in the following format:

## Executive Summary
Start with your final recommendation.
- **Recommended Pattern:** (State the top pattern from the DKB Analysis, e.g., "Event-driven Microservices").
- **Core Justification:** (Give a 1-2 sentence reason why it's the best fit, referencing the main NFRs like "Scalability" and "Low Latency").

## 1. Architectural Reasoning & Trade-offs
This is the most important section. Justify your decision.
- **Why this pattern?** Use the "fitScore" and "promotes" logic from the DKB. Explain how it directly solves the NFRs from the NLP analysis (e.g., "To handle 10,000 concurrent users (NFR: Scalability), the {dkb_results.get('top_choice_stack', {}).get('pattern', 'N/A')} is the only viable choice...").
- **Trade-offs (Why *not* other patterns?):** Look at the "ranked_patterns" list. If a "Monolith" was ranked low (e.g., negative "fitScore"), explain *why* it was rejected (e.g., "A Layered Monolith was not chosen because it 'HINDERS' the critical 'Scalability' requirement.").
- **Constraint Alignment:** Explicitly state how you will meet *every* constraint from the NLP Analysis (e.g., "For the 'AWS' constraint, this 'Cloud Native' pattern is ideal...").

## 2. High-Level Design & Data Flow
Describe how the system will work.
- Use the **Entities** from the NLP Analysis (e.g., "User", "Ride", "Driver") as the stars of your story.
- Explain how they interact within the chosen pattern (e.g., "1. The 'User' entity, via the API Gateway, creates a 'Ride' request...").

## 3. Recommended Tech Stack & Justification
Use the "top_choice_stack" from the DKB to build a concrete, practical tech stack.
- For each **component_type** (e.g., "Stream Processor"):
- **Select one** tool from the "alternatives" (e.g., "Apache Kafka").
- **Justify your choice.** You **must** use the "tags," "license," or "cost_model" from the DKB data to explain *why* you chose it (e.g., "For the Stream Processor, I recommend **Apache Kafka**. The DKB analysis shows it is 'durable' and 'high-throughput', which is essential for meeting the 'GDPR' (Auditability) requirement.").
- You must also incorporate technologies mentioned in the user's constraints (e.g., "Stripe").
"""

    # --- Make the actual API call ---
    try:
        response = model.generate_content(final_prompt_to_gemini)
        return response.text
    except Exception as e:
        print(f"Error during Gemini API call: {e}")
        return f"Error: The API call to Gemini failed. {e}"

# ======================================================================
# MAIN CONTROLLER FUNCTION
# ======================================================================

def get_architecture_recommendation(nlp_json_input: dict) -> str:
    """
    Orchestrates the full 3-stage process from a rich NLP JSON object.
    """
    if driver is None or dkb_concepts is None:
        return "Error: System is not initialized. Check Neo4j connection and 'dkb_embeddings.json' file."
        
    print(f"\n===== New Request: '{nlp_json_input.get('summary', 'N/A')}' =====")
    
    # --- STAGE 1 (UPDATED) ---
    # This now calls our new semantic search mapper
    mapped_inputs = _stage_1_mapper_embedding(nlp_json_input)
    
    # --- STAGE 2 (UNCHANGED) ---
    with driver.session() as session:
        dkb_results = _stage_2_dkb_query(session, mapped_inputs)
    
    if not dkb_results["ranked_patterns"]:
        return "I'm sorry, but no architectural patterns in our knowledge base fit your specific constraints. You may need to relax some of your requirements."
        
    # --- STAGE 3 (UPDATED) ---
    # This now calls the REAL Gemini function
    final_answer = stage_3_call_gemini_api(
        nlp_json=nlp_json_input,
        dkb_results=dkb_results
    )
    
    return final_answer

# ======================================================================
# EXAMPLE USAGE
# ======================================================================

if __name__ == "__main__":
    
    # The JSON you provided
    example_nlp_input = {
      "summary": "Build an intercity ride-sharing application that can handle 10000 concurrent users.. GDPR, AWS, Stripe",
      "functional_requirements": [
          {
              "id": "FR1",
              "text": "Drivers can accept ride requests."
          }
      ],
      "non_functional_requirements": [
        {
          "id": "NFR1",
          "text": "Ride matching latency should be less than 200ms.",
          "category": "performance"
        },
        {
          "id": "NFR2",
          "text": "The system must comply with GDPR regulations.",
          "category": "security"
        }
      ],
      "constraints": [
        {
          "id": "C2",
          "text": "The system should be deployed on AWS.",
          "type": "deployment"
        }
      ],
      "raw_input": "Build an intercity ride-sharing application that can handle 10000 concurrent users..."
    }

    # --- Run the full process ---
    if dkb_concepts and GEMINI_KEY: # Only run if the app loaded correctly
        recommendation = get_architecture_recommendation(example_nlp_input)
        
        print("\n--- FINAL ANSWER ---")
        print(recommendation)
        print("=========================\n")
    elif not GEMINI_KEY:
        print("Could not run example: GEMINI_API_KEY is not set in .env file.")
    elif not dkb_concepts:
         print("Could not run example: dkb_embeddings.json not found or failed to load.")
    
    # Close the driver when the script is done
    if driver:
        driver.close()
        print("Neo4j connection closed.")