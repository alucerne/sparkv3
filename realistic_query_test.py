import pinecone
import os
from dotenv import load_dotenv

def test_topic_filtered_query():
    """Test querying for specific topics like 'sheet metal roofing installation'."""
    
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
        
        print("🔍 Testing Topic-Filtered Query for 'Sheet Metal Roofing Installation'")
        print("=" * 70)
        
        # Test vector (in real usage, this would be an embedding of "sheet metal roofing installation")
        test_vector = [0.1] * 1024
        
        # First, let's get a broader search and then filter the results
        print("🔍 Broader search (top 20 matches) - looking for roofing/construction related topics:")
        print("-" * 70)
        
        response_broad = index.query(
            vector=test_vector,
            top_k=20,
            include_metadata=True
        )
        
        # Keywords related to sheet metal roofing installation
        roofing_keywords = ["roofing", "roof", "metal", "sheet", "installation", "construction", "contractor", "building"]
        
        roofing_matches = []
        other_matches = []
        
        for i, match in enumerate(response_broad.matches):
            topic = match.metadata.get('topic', 'N/A')
            # Check if topic contains roofing-related keywords
            is_roofing_related = any(keyword.lower() in topic.lower() for keyword in roofing_keywords)
            
            if is_roofing_related:
                roofing_matches.append((i+1, match))
            else:
                other_matches.append((i+1, match))
        
        # Show roofing-related matches first
        if roofing_matches:
            print("🏠 ROOFING/CONSTRUCTION RELATED MATCHES:")
            print("-" * 50)
            for rank, match in roofing_matches:
                print(f"🔎 Match #{rank}:")
                print(f"   ID: {match.id}")
                print(f"   Score: {match.score:.4f}")
                print(f"   Topic: {match.metadata.get('topic', 'N/A')}")
                print(f"   Topic ID: {match.metadata.get('topic_ID', 'N/A')}")
                print()
        
        # Show other matches
        if other_matches:
            print("🔎 OTHER MATCHES:")
            print("-" * 30)
            for rank, match in other_matches[:5]:  # Show first 5 other matches
                print(f"🔎 Match #{rank}:")
                print(f"   ID: {match.id}")
                print(f"   Score: {match.score:.4f}")
                print(f"   Topic: {match.metadata.get('topic', 'N/A')}")
                print(f"   Topic ID: {match.metadata.get('topic_ID', 'N/A')}")
                print()
        
        print(f"✅ Found {len(roofing_matches)} roofing/construction related matches out of {len(response_broad.matches)} total matches")
        
    except Exception as e:
        print(f"❌ Error during topic-filtered query: {str(e)}")

def test_exact_topic_search():
    """Test searching for exact topic matches."""
    
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
        
        print("🔍 Testing Exact Topic Search")
        print("=" * 50)
        
        # Test vector
        test_vector = [0.1] * 1024
        
        # Search for exact topic matches (if we know specific topics)
        exact_topics = [
            "Roofing",
            "Construction",
            "Contractor",
            "Building",
            "Installation"
        ]
        
        for topic in exact_topics:
            print(f"🔍 Searching for exact topic: '{topic}'")
            
            try:
                response = index.query(
                    vector=test_vector,
                    top_k=2,
                    include_metadata=True,
                    filter={
                        "topic": topic
                    }
                )
                
                if response.matches:
                    for match in response.matches:
                        print(f"   ✅ Found: {match.metadata.get('topic', 'N/A')}")
                        print(f"      ID: {match.id}, Score: {match.score:.4f}")
                else:
                    print(f"   ❌ No exact matches for '{topic}'")
                print()
                
            except Exception as e:
                print(f"   ⚠️  Error with topic '{topic}': {str(e)}")
                print()
        
        print("✅ Exact topic search completed!")
        
    except Exception as e:
        print(f"❌ Error during exact topic search: {str(e)}")

if __name__ == "__main__":
    print("🚀 Realistic Query Test for 'Sheet Metal Roofing Installation'")
    print("=" * 70)
    
    # Run topic-filtered query test
    test_topic_filtered_query()
    
    print("\n" + "=" * 70)
    
    # Run exact topic search
    test_exact_topic_search() 