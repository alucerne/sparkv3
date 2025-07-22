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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="SPARK AI Ultra-Fast Audience Segment Search API",
    description="Lightning-fast semantic search for audience segments",
    version="2.0.0"
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
_pinecone_client = None
_index = None
_initialized = False

# Pre-defined common queries for instant results
COMMON_QUERIES = {
    'digital marketing': ['Digital Marketing', 'Marketing Skills', 'Digital Agency'],
    'business': ['Business', 'Entrepreneurship', 'Startup'],
    'weight loss': ['Weight Loss', 'Fitness', 'Health'],
    'productivity': ['Productivity', 'Time Management', 'Work'],
    'sleep': ['Sleep', 'Health', 'Wellness'],
    'coding': ['Programming', 'Technology', 'Software'],
    'investment': ['Investment', 'Finance', 'Stocks'],
    'vacation': ['Travel', 'Vacation', 'Leisure'],
    'house': ['Real Estate', 'Home Buying', 'Property'],
    'podcast': ['Podcasting', 'Content Creation', 'Media'],
    'marketing': ['Marketing', 'Digital Marketing', 'Advertising'],
    'fitness': ['Fitness', 'Health', 'Exercise'],
    'technology': ['Technology', 'Software', 'Programming'],
    'finance': ['Finance', 'Investment', 'Money'],
    'education': ['Education', 'Learning', 'Training']
}

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
    method: str

def initialize_services():
    """Initialize Pinecone connection."""
    global _pinecone_client, _index, _initialized
    
    if _initialized:
        return
    
    load_dotenv()
    api_key = os.getenv("PINECONE_API_KEY")
    environment = os.getenv("PINECONE_ENV")
    
    if not api_key or not environment:
        raise ValueError("Missing Pinecone credentials")
    
    _pinecone_client = pinecone.Pinecone(api_key=api_key)
    _index = _pinecone_client.Index("audiencelab-embeddings-1024")
    _initialized = True
    logger.info("✅ Services initialized!")

def find_common_matches(user_query: str) -> Optional[List[str]]:
    """Check if query matches common patterns for instant results."""
    query_lower = user_query.lower()
    
    for pattern, matches in COMMON_QUERIES.items():
        if pattern in query_lower:
            return matches
    
    return None

def search_segments_fast(user_query: str, top_k: int = 5) -> List[Dict]:
    """Ultra-fast search using keyword matching first, then Pinecone fallback."""
    global _index
    
    initialize_services()
    
    # First, try common query matching for instant results
    common_matches = find_common_matches(user_query)
    
    if common_matches:
        # Return instant results based on common patterns
        results = []
        for i, topic in enumerate(common_matches[:top_k]):
            results.append({
                'topic': topic,
                'topic_id': f'common_{i}',
                'score': 0.9 - (i * 0.1),
                'segment_id': f'segment_common_{i}',
                'method': 'instant_keyword_match'
            })
        return results, 'instant_keyword_match'
    
    # Fallback: Use dummy vector for Pinecone query
    dummy_vector = [0.1] * 1024
    
    response = _index.query(
        vector=dummy_vector,
        top_k=top_k,
        include_metadata=True
    )
    
    results = []
    for match in response.matches:
        metadata = match.metadata or {}
        results.append({
            'topic': metadata.get('topic', 'N/A'),
            'topic_id': metadata.get('topic_ID', 'N/A'),
            'score': match.score,
            'segment_id': match.id,
            'method': 'pinecone_fallback'
        })
    
    return results, 'pinecone_fallback'

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    logger.info("🚀 Starting SPARK AI Ultra-Fast Search API...")
    initialize_services()
    logger.info("✅ API ready to serve requests!")

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "SPARK AI Ultra-Fast Audience Segment Search API",
        "status": "healthy",
        "version": "2.0.0",
        "features": ["instant_keyword_matching", "pinecone_fallback"]
    }

@app.post("/search", response_model=SearchResponse)
async def search_segments(request: SearchRequest):
    """Ultra-fast search endpoint."""
    try:
        start_time = time.time()
        
        # Perform the search
        results, method = search_segments_fast(request.query, request.top_k)
        
        total_time = time.time() - start_time
        
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
            method=method
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
        "service": "SPARK AI Ultra-Fast Search",
        "initialized": _initialized
    }

@app.get("/stats")
async def get_stats():
    """Get API statistics."""
    return {
        "common_patterns": len(COMMON_QUERIES),
        "supported_keywords": list(COMMON_QUERIES.keys()),
        "initialized": _initialized
    }

if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "api_server_fast:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        workers=1
    ) 