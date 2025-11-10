import json
import os
from neo4j import GraphDatabase
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

# --- Load Environment and Connect to Neo4j ---
load_dotenv()
URI = os.getenv("NEO4J_URI")
USER = os.getenv("NEO4J_USER")
PASS = os.getenv("NEO4J_PASSWORD")
driver = GraphDatabase.driver(URI, auth=(USER, PASS))

# Load the embedding model (a popular, fast, and high-quality model)
model = SentenceTransformer('all-MiniLM-L6-v2')

def fetch_all_concepts(session):
    """
    Query Neo4j to get all NFRs, Constraints, and Domains
    that we want to be able to search for.
    """
    print("Querying Neo4j for all concepts...")
    
    # This query finds all nodes with these labels
    query = """
    MATCH (n)
    WHERE n:NFR OR n:Constraint OR n:Domain
    RETURN 
        n.name AS name, 
        n.description AS description, 
        labels(n)[0] AS label
    """
    result = session.run(query)
    
    concepts = []
    for record in result:
        concepts.append({
            "name": record["name"],
            "description": record["description"],
            "label": record["label"] # e.g., "NFR", "Constraint"
        })
    return concepts

def create_and_save_embeddings(concepts):
    """
    Takes the list of concepts and generates embeddings.
    Saves them to a JSON file.
    """
    print(f"Found {len(concepts)} concepts. Generating embeddings...")
    
    # We will embed the name and description together for richer context
    # e.g., "NFR: Scalability. Ability to handle increasing load."
    texts_to_embed = [
        f"{c['label']}: {c['name']}. {c['description']}" for c in concepts
    ]
    
    # Generate embeddings. This is the main AI step.
    embeddings = model.encode(texts_to_embed, show_progress_bar=True)
    
    # Store concepts and embeddings in a file-friendly format
    output_data = {
        # We store the concepts so we know what each embedding row refers to
        "concepts": concepts,
        # We convert the numpy array to a standard list to save as JSON
        "embeddings": embeddings.tolist() 
    }
    
    with open('dkb_embeddings.json', 'w') as f:
        json.dump(output_data, f)
        
    print("Successfully saved concepts and embeddings to 'dkb_embeddings.json'")

def main():
    if driver is None:
        print("Could not initialize Neo4j driver.")
        return
        
    with driver.session() as session:
        all_concepts = fetch_all_concepts(session)
        if all_concepts:
            create_and_save_embeddings(all_concepts)
        else:
            print("No concepts found in the database.")
            
    driver.close()

if __name__ == "__main__":
    main()