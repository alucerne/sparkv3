import os
import pinecone
from dotenv import load_dotenv

def test_pinecone_connection():
    """Test connection to Pinecone and show index stats."""
    
    # Load environment variables
    load_dotenv()
    api_key = os.getenv("PINECONE_API_KEY")
    environment = os.getenv("PINECONE_ENV")
    
    if not api_key or not environment:
        print("❌ Missing Pinecone credentials in .env file")
        return
    
    try:
        print("🔗 Testing Pinecone connection...")
        
        # Initialize Pinecone
        pc = pinecone.Pinecone(api_key=api_key)
        
        # List all indexes
        indexes = pc.list_indexes()
        print(f"📋 Available indexes: {[index.name for index in indexes]}")
        
        # Connect to your main index
        index = pc.Index("audiencelab-embeddings-1024")
        
        # Get index stats
        stats = index.describe_index_stats()
        
        print(f"\n✅ Connection successful!")
        print(f"📊 Index: audiencelab-embeddings-1024")
        print(f"📈 Total vectors: {stats.total_vector_count}")
        print(f"🔢 Dimensions: {stats.dimension}")
        print(f"📏 Metric: {stats.metric}")
        
        # Test a simple query
        print(f"\n🔍 Testing a simple query...")
        response = index.query(
            vector=[0.1] * 1024,
            top_k=1,
            include_metadata=True
        )
        
        if response.matches:
            print(f"✅ Query successful! Found {len(response.matches)} match(es)")
            match = response.matches[0]
            print(f"   Sample result: {match.metadata.get('topic', 'N/A')}")
        else:
            print("⚠️  Query returned no matches")
            
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")

if __name__ == "__main__":
    test_pinecone_connection() 