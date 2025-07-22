import os
import time
import numpy as np
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import pinecone
from typing import List, Dict

# Global variables for caching
_model = None
_pinecone_client = None
_index = None
_initialized = False

def normalize(vec):
    """Normalize a vector to unit length (L2 norm)."""
    vec = np.array(vec)
    norm = np.linalg.norm(vec)
    if norm == 0:
        return vec
    return vec / norm

def initialize_services():
    """Initialize and cache the model and Pinecone connection."""
    global _model, _pinecone_client, _index, _initialized
    
    if _initialized:
        return
    
    start_time = time.time()
    
    # Load a much faster model (smaller, loads in ~2-5 seconds)
    if _model is None:
        print("🔄 Loading fast embedding model (all-MiniLM-L6-v2)...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")  # Much smaller model
        print("✅ Fast model loaded and cached!")
    
    # Initialize Pinecone connection
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
    
    _initialized = True
    print(f"🚀 Services initialized in {time.time() - start_time:.2f} seconds")

def find_matching_segments(user_query: str, top_k: int = 5) -> List[Dict]:
    """
    Fast search function using lightweight model.
    """
    global _model, _index
    
    # Ensure services are initialized
    initialize_services()
    
    start_time = time.time()
    
    # Generate embedding (much faster with smaller model)
    embedding = _model.encode(user_query)
    embedding = normalize(embedding)
    
    embedding_time = time.time() - start_time
    
    # Query Pinecone
    response = _index.query(
        vector=embedding.tolist(),
        top_k=top_k,
        include_metadata=True
    )
    
    query_time = time.time() - start_time - embedding_time
    
    # Process results
    results = []
    for match in response.matches:
        metadata = match.metadata or {}
        results.append({
            'topic': metadata.get('topic', 'N/A'),
            'topic_id': metadata.get('topic_ID', 'N/A'),
            'score': match.score,
            'segment_id': match.id
        })
    
    total_time = time.time() - start_time
    
    print(f"⚡ Search completed in {total_time:.3f}s (embedding: {embedding_time:.3f}s, query: {query_time:.3f}s)")
    
    return results

def display_results(results: List[Dict]):
    """Display search results in a formatted way."""
    print("\n=== Top Matching Audience Segments ===")
    if not results:
        print("No matches found.")
        return
    
    for i, result in enumerate(results, 1):
        print(f"\n#{i}")
        print(f"Topic: {result['topic']}")
        print(f"Topic ID: {result['topic_id']}")
        print(f"Score: {result['score']:.4f}")
        print(f"Segment ID: {result['segment_id']}")

if __name__ == "__main__":
    print("\n🟢 FAST Intent-Based Audience Segment Search")
    print("--------------------------------------------")
    print("💡 Using lightweight model for speed")
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
        
        results = find_matching_segments(user_query)
        display_results(results) 