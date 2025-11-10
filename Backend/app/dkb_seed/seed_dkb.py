import json, os
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

URI = os.getenv("NEO4J_URI")
USER = os.getenv("NEO4J_USER")
PASS = os.getenv("NEO4J_PASSWORD")
driver = GraphDatabase.driver(URI, auth=(USER, PASS))


def create_pattern(tx, p):
    """Creates a :Pattern node"""
    tx.run("""
    MERGE (pat:Pattern {id: $id})
    SET pat.name = $name,
        pat.description = $desc,
        pat.pattern_type = $ptype,
        pat.template = $template,
        pat.cost = $cost
    """, id=p["id"], name=p["name"], desc=p.get("description"),
       ptype=p.get("pattern_type"), template=p.get("template"), cost=p.get("cost", 0))

def create_component(tx, c):
    tx.run("""
    MERGE (comp:Component {id: $id})
    SET comp.name = $name,
        comp.description = $desc,
        comp.license = $license,
        comp.cost_model = $cost_model,
        comp.tags = $tags
    """, id=c["id"], name=c["name"], desc=c.get("description"),
       license=c.get("license"), cost_model=c.get("cost_model"), tags=c.get("tags", []))

def create_component_type(tx, ct):
    tx.run("""
    MERGE (ct:ComponentType {id: $id})
    SET ct.name = $name,
        ct.description = $desc
    """, id=ct["id"], name=ct["name"], desc=ct.get("description"))

def create_concept(tx, label, c):
    """
    Creates a concept node with a dynamic label.
    label: 'NFR', 'Constraint', or 'Domain'
    c: The concept object from concepts.json
    """
    # Use an f-string to set the label dynamically
    query = f"""
    MERGE (n:{label} {{id: $id}})
    SET n.name = $name,
        n.description = $desc
    """
    tx.run(query, id=c["id"], name=c["name"], desc=c.get("description"))

def link_component_to_type(tx, comp_id, type_id):
    """Creates a (Component)-[:IS_A]->(ComponentType) relationship"""
    tx.run("""
    MATCH (c:Component {id: $cid})
    MATCH (ct:ComponentType {id: $tid})
    MERGE (c)-[:IS_A]->(ct)
    """, cid=comp_id, tid=type_id)

def link_pattern_to_type(tx, pattern_id, type_id):
    """Creates a (Pattern)-[:REQUIRES]->(ComponentType) relationship"""
    tx.run("""
    MATCH (p:Pattern {id: $pid})
    MATCH (ct:ComponentType {id: $tid})
    MERGE (p)-[:REQUIRES]->(ct)
    """, pid=pattern_id, tid=type_id)

def link_pattern_to_concept(tx, pattern_id, concept_id, rel_type):
    """
    Creates a dynamic relationship from a Pattern to a Concept.
    rel_type: 'PROMOTES', 'HINDERS', 'SUITS', etc.
    """
    # Use an f-string to set the relationship type dynamically
    query = f"""
    MATCH (p:Pattern {{id: $pid}})
    MATCH (c {{id: $cid}})
    MERGE (p)-[:{rel_type}]->(c)
    """
    tx.run(query, pid=pattern_id, cid=concept_id)

def clear_database(tx):
    """Deletes all nodes and relationships. Useful for a clean re-seed."""
    tx.run("MATCH (n) DETACH DELETE n")

# --- Main Execution ---

def main():
    # Load all our JSON data files
    try:
        patterns = json.load(open("patterns.json"))
        components = json.load(open("components.json"))
        component_types = json.load(open("component_types.json"))
        concepts = json.load(open("concepts.json"))
        relationships = json.load(open("relationships.json"))
    except FileNotFoundError as e:
        print(f"Error: Could not find a required JSON file. {e}")
        print("Please make sure patterns.json, components.json, component_types.json, concepts.json, and relationships.json exist in 'dkb_seed/'.")
        return

    with driver.session() as s:
        print("Clearing entire database...")
        s.execute_write(clear_database)
        print("Database cleared.")

        print("Creating nodes...")

        # Create Patterns
        for p in patterns:
            s.execute_write(create_pattern, p)

        # Create ComponentTypes
        for ct in component_types:
            s.execute_write(create_component_type, ct)

        # Create Components
        for c in components:
            s.execute_write(create_component, c)

        # Create Concepts (NFRs, Constraints, Domains)
        for nfr in concepts["nfrs"]:
            s.execute_write(create_concept, "NFR", nfr)
        for con in concepts["constraints"]:
            s.execute_write(create_concept, "Constraint", con)
        for dom in concepts["domains"]:
            s.execute_write(create_concept, "Domain", dom)
        
        print("All nodes created successfully.")

        print("Creating relationships...")

        # Link Components to their Types (Component)-[:IS_A]->(Type)
        for c in components:
            if c.get("type_id"):
                s.execute_write(link_component_to_type, c["id"], c["type_id"])

        # Link Patterns to their required ComponentTypes (Pattern)-[:REQUIRES]->(Type)
        for link in relationships["requirement_links"]:
            s.execute_write(link_pattern_to_type, link["pattern_id"], link["type_id"])
        
        # Link Patterns to Concepts (Pattern)-[:PROMOTES]->(NFR), etc.
        for link in relationships["concept_links"]:
            s.execute_write(link_pattern_to_concept, link["pattern_id"], link["concept_id"], link["rel_type"])

        print("All relationships created successfully.")
        print("\n--- Seeding DKB successfully completed! ---")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\nAn error occurred: {e}")
    finally:
        driver.close()