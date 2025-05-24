from neo4j import GraphDatabase
import json

# Neo4j connection details
NEO4J_URI = "bolt://localhost:7687"  # Change if using Neo4j Aura
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "password"

# Load JSON mock email workflow
with open("email_workflow.json") as f:
    data = json.load(f)


# Neo4j Handler Class
class Neo4jHandler:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def create_graph(self, events):
        with self.driver.session() as session:
            for i in range(len(events)):
                event = events[i]
                session.run(
                    """
                    MERGE (e:Event {type: $type, timestamp: $timestamp})
                    SET e.details = $details
                    """,
                    type=event["event_type"], timestamp=event["timestamp"], details=str(event)
                )

                # Create sequential relationships between events
                if i > 0:
                    prev_event = events[i - 1]
                    session.run(
                        """
                        MATCH (e1:Event {type: $prev_type, timestamp: $prev_timestamp}),
                              (e2:Event {type: $current_type, timestamp: $current_timestamp})
                        MERGE (e1)-[:NEXT_EVENT]->(e2)
                        """,
                        prev_type=prev_event["event_type"], prev_timestamp=prev_event["timestamp"],
                        current_type=event["event_type"], current_timestamp=event["timestamp"]
                    )


# Initialize Neo4jHandler
neo4j_handler = Neo4jHandler(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)

# Create graph nodes & relationships
neo4j_handler.create_graph(data["events"])

# Close connection
neo4j_handler.close()
print("Workflow graph successfully created in Neo4j!")
