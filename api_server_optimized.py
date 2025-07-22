from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn
import time
import logging
import os
from dotenv import load_dotenv
import pinecone
from sentence_transformers import SentenceTransformer
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="SPARK AI Optimized Audience Segment Search API",
    description="Fast semantic search using BAAI/bge-large-en-v1.5 embeddings",
    version="3.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
_model = None
_pinecone_client = None
_index = None
_initialized = False

# Pydantic models
class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5

class SearchResult(BaseModel):
    topic: str
    topic_id: str
    score: float
    segment_id: str
    method: str

class SearchResponse(BaseModel):
    results: List[SearchResult]
    query: str
    total_time: float
    embedding_time: float
    query_time: float

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
    
    # Load the BAAI/bge-large-en-v1.5 model (cached for performance)
    if _model is None:
        logger.info("🔄 Loading embedding model (BAAI/bge-large-en-v1.5)...")
        _model = SentenceTransformer("BAAI/bge-large-en-v1.5")
        logger.info("✅ Model loaded and cached!")
    
    # Initialize Pinecone connection
    if _pinecone_client is None:
        load_dotenv()
        api_key = os.getenv("PINECONE_API_KEY")
        environment = os.getenv("PINECONE_ENV")
        
        if not api_key or not environment:
            raise ValueError("Missing Pinecone credentials")
        
        logger.info("🔗 Connecting to Pinecone...")
        _pinecone_client = pinecone.Pinecone(api_key=api_key)
        _index = _pinecone_client.Index("audiencelab-embeddings-1024")
        logger.info("✅ Pinecone connected!")
    
    _initialized = True
    logger.info(f"🚀 Services initialized in {time.time() - start_time:.2f} seconds")

def search_segments_optimized(user_query: str, top_k: int = 5) -> List[Dict]:
    """Optimized search using BAAI/bge-large-en-v1.5 embeddings."""
    global _model, _index
    
    initialize_services()
    
    start_time = time.time()
    
    # Generate embedding using the actual model
    logger.info(f"🔎 Generating embedding for: '{user_query}'")
    embedding = _model.encode(user_query)
    embedding = normalize(embedding)
    
    embedding_time = time.time() - start_time
    
    # Query Pinecone with the real embedding
    logger.info(f"📡 Querying Pinecone for top {top_k} matches...")
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
            'segment_id': match.id,
            'method': 'semantic_search'
        })
    
    total_time = time.time() - start_time
    
    logger.info(f"⚡ Search completed in {total_time:.3f}s (embedding: {embedding_time:.3f}s, query: {query_time:.3f}s)")
    
    return results, total_time, embedding_time, query_time

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    logger.info("🚀 Starting SPARK AI Optimized Search API...")
    initialize_services()
    logger.info("✅ API ready to serve requests!")

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "SPARK AI Optimized Audience Segment Search API",
        "status": "healthy",
        "version": "3.0.0",
        "model": "BAAI/bge-large-en-v1.5",
        "features": ["semantic_search", "model_caching", "optimized_performance"]
    }

@app.post("/search", response_model=SearchResponse)
async def search_segments(request: SearchRequest):
    """Optimized search endpoint using real embeddings."""
    try:
        # Perform the search with actual embeddings
        results, total_time, embedding_time, query_time = search_segments_optimized(request.query, request.top_k)
        
        # Convert to Pydantic models
        search_results = [
            SearchResult(
                topic=result['topic'],
                topic_id=result['topic_id'],
                score=result['score'],
                segment_id=result['segment_id'],
                method=result['method']
            )
            for result in results
        ]
        
        return SearchResponse(
            results=search_results,
            query=request.query,
            total_time=total_time,
            embedding_time=embedding_time,
            query_time=query_time
        )
        
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "service": "SPARK AI Optimized Search",
        "model": "BAAI/bge-large-en-v1.5",
        "initialized": _initialized,
        "model_loaded": _model is not None
    }

@app.get("/stats")
async def get_stats():
    """Get API statistics."""
    return {
        "model": "BAAI/bge-large-en-v1.5",
        "dimensions": 1024,
        "initialized": _initialized,
        "features": [
            "Semantic search with real embeddings",
            "Model caching for performance",
            "Proper vector normalization",
            "Detailed timing breakdown"
        ]
    }

@app.get("/usage")
async def get_usage():
    """Get current Pinecone usage and estimated costs."""
    try:
        # Get index stats
        stats = _index.describe_index_stats()
        
        # Calculate estimated costs
        total_vectors = stats.get('total_vector_count', 0)
        dimension = stats.get('dimension', 1024)
        
        # Estimate storage cost (rough calculation)
        storage_gb = (total_vectors * dimension * 4) / (1024**3)  # 4 bytes per float32
        storage_cost = storage_gb * 0.096  # $0.096 per GB
        
        return {
            "index_name": "audiencelab-embeddings-1024",
            "total_vectors": total_vectors,
            "dimension": dimension,
            "estimated_storage_gb": round(storage_gb, 2),
            "estimated_storage_cost_monthly": round(storage_cost, 2),
            "pricing_info": {
                "operations_cost": "$0.096 per 1,000 operations",
                "storage_cost": "$0.096 per GB per month",
                "free_tier_limit": "10,000 operations/month"
            }
        }
    except Exception as e:
        logger.error(f"Error getting usage stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get usage stats")

if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "api_server_optimized:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        workers=1
    ) 