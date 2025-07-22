import os
import pinecone
from dotenv import load_dotenv

def verify_embeddings():
    """Verify embeddings uploaded to Pinecone."""
    
    # Load environment variables
    load_dotenv()
    api_key = os.getenv('PINECONE_API_KEY')
    environment = os.getenv('PINECONE_ENV')
    
    if not api_key or not environment:
        print("❌ Error: Missing Pinecone credentials in .env file")
        return
    
    try:
        # Initialize Pinecone
        pc = pinecone.Pinecone(api_key=api_key)
        index = pc.Index("audiencelab-embeddings")
        
        # Get index stats
        stats = index.describe_index_stats()
        
        print("📊 Pinecone Index Statistics:")
        print(f"   Index Name: audiencelab-embeddings")
        print(f"   Total Vectors: {stats.total_vector_count}")
        print(f"   Index Dimension: {stats.dimension}")
        print(f"   Index Metric: {stats.metric}")
        
        # Get sample vectors to verify metadata
        print("\n🔍 Sample Vectors (first 5):")
        sample_vectors = index.query(
            vector=[0.1] * 384,  # Dummy vector for sampling
            top_k=5,
            include_metadata=True
        )
        
        for i, match in enumerate(sample_vectors.matches):
            print(f"   Vector {i+1}:")
            print(f"     ID: {match.id}")
            print(f"     Score: {match.score:.4f}")
            print(f"     Metadata: {match.metadata}")
            print()
        
        # Check for specific topics if you know some
        print("🎯 Checking for Topic Distribution:")
        topic_counts = {}
        
        # Query a few more vectors to see topic distribution
        more_vectors = index.query(
            vector=[0.1] * 384,
            top_k=100,
            include_metadata=True
        )
        
        for match in more_vectors.matches:
            if 'topic' in match.metadata:
                topic = match.metadata['topic']
                topic_counts[topic] = topic_counts.get(topic, 0) + 1
        
        print("   Sample Topic Distribution (from 100 vectors):")
        for topic, count in sorted(topic_counts.items())[:10]:  # Show top 10
            print(f"     {topic}: {count} vectors")
        
        if len(topic_counts) > 10:
            print(f"     ... and {len(topic_counts) - 10} more topics")
        
        print(f"\n✅ Verification Complete!")
        print(f"   Your index contains {stats.total_vector_count} vectors")
        print(f"   Each vector has {stats.dimension} dimensions")
        print(f"   Metadata includes topic and topic_ID fields")
        
    except Exception as e:
        print(f"❌ Error verifying embeddings: {str(e)}")

if __name__ == "__main__":
    verify_embeddings() 