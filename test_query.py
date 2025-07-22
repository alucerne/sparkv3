import pinecone
import os
from dotenv import load_dotenv

def test_query():
    """Test querying the Pinecone index with sample vectors."""
    
    # Load API keys
    load_dotenv()
    api_key = os.getenv("PINECONE_API_KEY")
    environment = os.getenv("PINECONE_ENV")
    
    if not api_key or not environment:
        print("❌ Error: Missing Pinecone credentials in .env file")
        return
    
    try:
        # Initialize Pinecone with new API
        pc = pinecone.Pinecone(api_key=api_key)
        
        # Connect to your index (1024 dimensions)
        index = pc.Index("audiencelab-embeddings-1024")
        
        print("🔍 Testing Pinecone Query...")
        print(f"   Index: audiencelab-embeddings-1024")
        print(f"   Dimensions: 1024")
        print()
        
        # Use a dummy test vector (length must be 1024 to match your index)
        test_vector = [0.1] * 1024
        
        # Run the query
        response = index.query(
            vector=test_vector,
            top_k=5,
            include_metadata=True
        )
        
        print(f"📊 Query Results (Top 5 matches):")
        print("=" * 50)
        
        # Print results
        for i, match in enumerate(response.matches):
            print(f"🔎 Match #{i+1}:")
            print(f"   ID: {match.id}")
            print(f"   Score: {match.score:.4f}")
            
            # Print metadata (topic and topic_ID)
            if match.metadata:
                if 'topic' in match.metadata:
                    print(f"   Topic: {match.metadata['topic']}")
                if 'topic_ID' in match.metadata:
                    print(f"   Topic ID: {match.metadata['topic_ID']}")
            
            print()
        
        # Test with a different query vector
        print("🔍 Testing with a different query vector...")
        print("=" * 50)
        
        # Create a slightly different test vector
        test_vector_2 = [0.2] * 1024
        
        response_2 = index.query(
            vector=test_vector_2,
            top_k=3,
            include_metadata=True
        )
        
        for i, match in enumerate(response_2.matches):
            print(f"🔎 Match #{i+1}:")
            print(f"   ID: {match.id}")
            print(f"   Score: {match.score:.4f}")
            
            if match.metadata:
                if 'topic' in match.metadata:
                    print(f"   Topic: {match.metadata['topic']}")
                if 'topic_ID' in match.metadata:
                    print(f"   Topic ID: {match.metadata['topic_ID']}")
            
            print()
        
        print("✅ Query test completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during query: {str(e)}")

def test_filtered_query():
    """Test querying with metadata filters."""
    
    # Load API keys
    load_dotenv()
    api_key = os.getenv("PINECONE_API_KEY")
    
    if not api_key:
        print("❌ Error: Missing Pinecone credentials in .env file")
        return
    
    try:
        # Initialize Pinecone
        pc = pinecone.Pinecone(api_key=api_key)
        index = pc.Index("audiencelab-embeddings-1024")
        
        print("🔍 Testing Filtered Query...")
        print("=" * 50)
        
        # Test vector
        test_vector = [0.1] * 1024
        
        # Try to find a specific topic (this will work if the topic exists)
        # You can modify this filter based on your actual topic data
        response = index.query(
            vector=test_vector,
            top_k=3,
            include_metadata=True,
            filter={
                "topic": {"$exists": True}  # Filter for vectors that have a topic
            }
        )
        
        print(f"📊 Filtered Results (vectors with topic metadata):")
        for i, match in enumerate(response.matches):
            print(f"🔎 Match #{i+1}:")
            print(f"   ID: {match.id}")
            print(f"   Score: {match.score:.4f}")
            
            if match.metadata:
                if 'topic' in match.metadata:
                    print(f"   Topic: {match.metadata['topic']}")
                if 'topic_ID' in match.metadata:
                    print(f"   Topic ID: {match.metadata['topic_ID']}")
            
            print()
        
        print("✅ Filtered query test completed!")
        
    except Exception as e:
        print(f"❌ Error during filtered query: {str(e)}")

if __name__ == "__main__":
    print("🚀 Pinecone Query Test Script")
    print("=" * 50)
    
    # Run basic query test
    test_query()
    
    print("\n" + "=" * 50)
    
    # Run filtered query test
    test_filtered_query() 