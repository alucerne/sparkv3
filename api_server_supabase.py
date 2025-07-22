from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn
import time
import logging
import os
from dotenv import load_dotenv
from supabase_setup import SupabaseVectorDB

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="SPARK AI Audience Segment Search API (Supabase)",
    description="Semantic search for audience segments using Supabase pgvector",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Supabase instance
supabase_db = None

# Pydantic models for request/response
class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5

class SearchResult(BaseModel):
    topic: str
    topic_id: str
    score: float
    segment_id: str
    description: Optional[str] = None
    metadata: Optional[Dict] = None

class SearchResponse(BaseModel):
    results: List[SearchResult]
    query: str
    total_time: float
    embedding_time: float
    query_time: float

@app.on_event("startup")
async def startup_event():
    """Initialize Supabase connection on startup."""
    global supabase_db
    
    logger.info("🚀 Starting SPARK AI with Supabase...")
    
    # Check for Supabase URL
    if not os.getenv('SUPABASE_DB_URL'):
        logger.error("❌ Missing SUPABASE_DB_URL environment variable")
        raise Exception("SUPABASE_DB_URL not configured")
    
    # Initialize Supabase
    supabase_db = SupabaseVectorDB()
    
    # Connect and setup
    if not supabase_db.connect():
        raise Exception("Failed to connect to Supabase")
    
    if not supabase_db.setup_vector_extension():
        raise Exception("Failed to setup pgvector extension")
    
    if not supabase_db.create_audience_segments_table():
        raise Exception("Failed to create audience segments table")
    
    if not supabase_db.create_vector_index():
        raise Exception("Failed to create vector index")
    
    if not supabase_db.load_embedding_model():
        raise Exception("Failed to load embedding model")
    
    logger.info("✅ SPARK AI with Supabase ready to serve requests!")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up Supabase connection on shutdown."""
    global supabase_db
    if supabase_db:
        supabase_db.close()
        logger.info("✅ Supabase connection closed")

@app.get("/")
async def root():
    """Health check endpoint."""
    global supabase_db
    
    if not supabase_db:
        raise HTTPException(status_code=503, detail="Database not initialized")
    
    segment_count = supabase_db.get_segment_count()
    
    return {
        "message": "SPARK AI Audience Segment Search API (Supabase)",
        "status": "healthy",
        "version": "1.0.0",
        "database": "Supabase PostgreSQL with pgvector",
        "total_segments": segment_count
    }

@app.post("/search", response_model=SearchResponse)
async def search_segments(request: SearchRequest):
    """
    Search for audience segments using Supabase pgvector.
    
    Args:
        request: SearchRequest containing query and optional top_k
        
    Returns:
        SearchResponse with matching segments and timing information
    """
    global supabase_db
    
    if not supabase_db:
        raise HTTPException(status_code=503, detail="Database not initialized")
    
    try:
        start_time = time.time()
        
        # Perform the search using Supabase
        results = supabase_db.search_similar_segments(request.query, request.top_k)
        
        total_time = time.time() - start_time
        
        # Convert to Pydantic models
        search_results = [
            SearchResult(
                topic=result['topic'],
                topic_id=result['topic_id'],
                score=result['score'],
                segment_id=result['segment_id'],
                description=result.get('description'),
                metadata=result.get('metadata')
            )
            for result in results
        ]
        
        return SearchResponse(
            results=search_results,
            query=request.query,
            total_time=total_time,
            embedding_time=total_time * 0.7,  # Approximate
            query_time=total_time * 0.3       # Approximate
        )
        
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Detailed health check endpoint."""
    global supabase_db
    
    if not supabase_db:
        return {
            "status": "unhealthy",
            "database": "not_connected",
            "message": "Supabase database not initialized"
        }
    
    try:
        segment_count = supabase_db.get_segment_count()
        return {
            "status": "healthy",
            "database": "connected",
            "total_segments": segment_count,
            "vector_extension": "enabled",
            "embedding_model": "BAAI/bge-large-en-v1.5"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "error",
            "message": str(e)
        }

@app.get("/stats")
async def get_stats():
    """Get database statistics."""
    global supabase_db
    
    if not supabase_db:
        raise HTTPException(status_code=503, detail="Database not initialized")
    
    try:
        segment_count = supabase_db.get_segment_count()
        return {
            "total_segments": segment_count,
            "database_type": "Supabase PostgreSQL",
            "vector_extension": "pgvector",
            "embedding_model": "BAAI/bge-large-en-v1.5",
            "embedding_dimension": 1024
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 