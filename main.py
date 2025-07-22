import os
import numpy as np
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import pinecone

# Global variables for caching
_model = None
_pinecone_client = None
_index = None

def normalize(vec):
    """Normalize a vector to unit length (L2 norm)."""
    vec = np.array(vec)
    norm = np.linalg.norm(vec)
    if norm == 0:
        return vec
    return vec / norm

def initialize_services():
    """Initialize and cache the model and Pinecone connection."""
    global _model, _pinecone_client, _index
    
    if _model is None:
        print("🔄 Loading embedding model (BAAI/bge-large-en-v1.5)...")
        _model = SentenceTransformer("BAAI/bge-large-en-v1.5")
        print("✅ Model loaded and cached!")
    
    if _pinecone_client is None:
        load_dotenv()
        api_key = os.getenv("PINECONE_API_KEY")
        environment = os.getenv("PINECONE_ENV")
        if not api_key or not environment:
            raise ValueError("❌ Missing Pinecone credentials in .env file.")
        
        print("🔗 Connecting to Pinecone...")
        _pinecone_client = pinecone.Pinecone(api_key=api_key)
        _index = _pinecone_client.Index("audiencelab-embeddings-1024")
        print("✅ Pinecone connected and cached!")

def find_matching_segments(user_query, top_k=5):
    """
    Given a user query (natural language),
    1. Generate an embedding using the cached BAAI/bge-large-en-v1.5 model
    2. Normalize the embedding
    3. Query Pinecone for the top_k most similar audience segments
    4. Print results: Topic, Topic ID, Score, Segment ID
    """
    global _model, _index
    
    # Ensure services are initialized
    initialize_services()
    
    # Generate and normalize the embedding
    print(f"🔎 Generating embedding for: '{user_query}'")
    embedding = _model.encode(user_query)
    embedding = normalize(embedding)

    # Query Pinecone
    print(f"📡 Querying Pinecone for top {top_k} matches...")
    response = _index.query(
        vector=embedding.tolist(),  # Convert numpy array to Python list
        top_k=top_k,
        include_metadata=True
    )

    # Display results
    print("\n=== Top Matching Audience Segments ===")
    if not response.matches:
        print("No matches found.")
        return
    for i, match in enumerate(response.matches, 1):
        metadata = match.metadata or {}
        print(f"\n#{i}")
        print(f"Topic: {metadata.get('topic', 'N/A')}")
        print(f"Topic ID: {metadata.get('topic_ID', 'N/A')}")
        print(f"Score: {match.score:.4f}")
        print(f"Segment ID: {match.id}")

if __name__ == "__main__":
    print("\n🟢 Intent-Based Audience Segment Search")
    print("----------------------------------------")
    print("💡 Focus on WHAT they want to do, not WHO they are")
    print("Examples:")
    print("  • 'start a business'")
    print("  • 'lose weight'") 
    print("  • 'learn digital marketing'")
    print("  • 'improve productivity'")
    print("  • 'get better sleep'")
    print()
    
    # Initialize services once at startup
    initialize_services()
    
    while True:
        user_query = input("\nEnter the intent/topic (or 'quit' to exit): ")
        if user_query.lower() in ['quit', 'exit', 'q']:
            break
        find_matching_segments(user_query) 