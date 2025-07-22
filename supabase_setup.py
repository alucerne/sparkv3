#!/usr/bin/env python3
"""
Supabase setup for SPARK AI - replacing Pinecone with pgvector
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
import numpy as np
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class SupabaseVectorDB:
    def __init__(self):
        self.connection_string = os.getenv('SUPABASE_DB_URL')
        self.model = None
        self.embedding_dimension = 1024  # BAAI/bge-large-en-v1.5 dimension
        
    def connect(self):
        """Connect to Supabase PostgreSQL database."""
        try:
            self.conn = psycopg2.connect(self.connection_string)
            logger.info("✅ Connected to Supabase PostgreSQL")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to connect to Supabase: {e}")
            return False
    
    def setup_vector_extension(self):
        """Enable pgvector extension if not already enabled."""
        try:
            with self.conn.cursor() as cur:
                cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
                self.conn.commit()
                logger.info("✅ pgvector extension enabled")
                return True
        except Exception as e:
            logger.error(f"❌ Failed to enable pgvector: {e}")
            return False
    
    def create_audience_segments_table(self):
        """Create the audience segments table with vector support."""
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS audience_segments (
                        id SERIAL PRIMARY KEY,
                        segment_id VARCHAR(255) UNIQUE NOT NULL,
                        topic VARCHAR(500) NOT NULL,
                        topic_id VARCHAR(255),
                        description TEXT,
                        embedding vector(1024),
                        metadata JSONB,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                self.conn.commit()
                logger.info("✅ Audience segments table created")
                return True
        except Exception as e:
            logger.error(f"❌ Failed to create table: {e}")
            return False
    
    def create_vector_index(self):
        """Create a vector index for similarity search."""
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    CREATE INDEX IF NOT EXISTS audience_segments_embedding_idx 
                    ON audience_segments 
                    USING ivfflat (embedding vector_cosine_ops)
                    WITH (lists = 100);
                """)
                self.conn.commit()
                logger.info("✅ Vector index created")
                return True
        except Exception as e:
            logger.error(f"❌ Failed to create index: {e}")
            return False
    
    def load_embedding_model(self):
        """Load the BAAI/bge-large-en-v1.5 embedding model."""
        try:
            logger.info("🔄 Loading embedding model...")
            self.model = SentenceTransformer("BAAI/bge-large-en-v1.5")
            logger.info("✅ Embedding model loaded")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            return False
    
    def insert_segment(self, segment_id: str, topic: str, topic_id: str, 
                      description: str = None, metadata: dict = None):
        """Insert an audience segment with its embedding."""
        try:
            # Generate embedding
            text_to_embed = f"{topic} {description or ''}"
            embedding = self.model.encode(text_to_embed)
            embedding = embedding / np.linalg.norm(embedding)  # Normalize
            
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO audience_segments 
                    (segment_id, topic, topic_id, description, embedding, metadata)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (segment_id) DO UPDATE SET
                    topic = EXCLUDED.topic,
                    topic_id = EXCLUDED.topic_id,
                    description = EXCLUDED.description,
                    embedding = EXCLUDED.embedding,
                    metadata = EXCLUDED.metadata;
                """, (segment_id, topic, topic_id, description, embedding.tolist(), metadata))
                self.conn.commit()
                logger.info(f"✅ Inserted segment: {topic}")
                return True
        except Exception as e:
            logger.error(f"❌ Failed to insert segment: {e}")
            return False
    
    def search_similar_segments(self, query: str, top_k: int = 5):
        """Search for similar audience segments using vector similarity."""
        try:
            # Generate query embedding
            query_embedding = self.model.encode(query)
            query_embedding = query_embedding / np.linalg.norm(query_embedding)
            
            with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT 
                        segment_id,
                        topic,
                        topic_id,
                        description,
                        metadata,
                        1 - (embedding <=> %s) as similarity_score
                    FROM audience_segments
                    ORDER BY embedding <=> %s
                    LIMIT %s;
                """, (query_embedding.tolist(), query_embedding.tolist(), top_k))
                
                results = []
                for row in cur.fetchall():
                    results.append({
                        'segment_id': row['segment_id'],
                        'topic': row['topic'],
                        'topic_id': row['topic_id'],
                        'description': row['description'],
                        'metadata': row['metadata'],
                        'score': float(row['similarity_score'])
                    })
                
                logger.info(f"✅ Found {len(results)} similar segments")
                return results
        except Exception as e:
            logger.error(f"❌ Search failed: {e}")
            return []
    
    def get_segment_count(self):
        """Get the total number of audience segments."""
        try:
            with self.conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) FROM audience_segments;")
                count = cur.fetchone()[0]
                return count
        except Exception as e:
            logger.error(f"❌ Failed to get count: {e}")
            return 0
    
    def close(self):
        """Close the database connection."""
        if hasattr(self, 'conn'):
            self.conn.close()
            logger.info("✅ Database connection closed")

def setup_supabase():
    """Main setup function."""
    print("🚀 Setting up Supabase for SPARK AI")
    print("=" * 50)
    
    # Check environment variables
    if not os.getenv('SUPABASE_DB_URL'):
        print("❌ Missing SUPABASE_DB_URL environment variable")
        print("Please set it to your Supabase PostgreSQL connection string")
        return False
    
    # Initialize Supabase
    db = SupabaseVectorDB()
    
    # Connect to database
    if not db.connect():
        return False
    
    # Setup vector extension
    if not db.setup_vector_extension():
        return False
    
    # Create table
    if not db.create_audience_segments_table():
        return False
    
    # Create index
    if not db.create_vector_index():
        return False
    
    # Load model
    if not db.load_embedding_model():
        return False
    
    # Test with sample data
    print("\n🧪 Testing with sample data...")
    sample_segments = [
        {
            'segment_id': 'test_001',
            'topic': 'Digital Marketing Professionals',
            'topic_id': 'DIG_MARK_001',
            'description': 'Marketing professionals interested in digital strategies'
        },
        {
            'segment_id': 'test_002', 
            'topic': 'E-commerce Entrepreneurs',
            'topic_id': 'ECOMM_001',
            'description': 'Business owners focused on online retail'
        }
    ]
    
    for segment in sample_segments:
        db.insert_segment(**segment)
    
    # Test search
    print("\n🔍 Testing search functionality...")
    results = db.search_similar_segments("digital marketing strategies", 3)
    
    if results:
        print("✅ Search test successful!")
        for i, result in enumerate(results, 1):
            print(f"   {i}. {result['topic']} (Score: {result['score']:.3f})")
    else:
        print("❌ Search test failed")
    
    # Get count
    count = db.get_segment_count()
    print(f"\n📊 Total segments in database: {count}")
    
    # Cleanup
    db.close()
    
    print("\n🎉 Supabase setup complete!")
    print("\n📋 Next steps:")
    print("1. Update your FastAPI server to use Supabase instead of Pinecone")
    print("2. Migrate your existing audience segment data")
    print("3. Update environment variables")
    
    return True

if __name__ == "__main__":
    setup_supabase() 