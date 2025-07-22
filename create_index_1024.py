import os
import pinecone
from dotenv import load_dotenv

def create_index_1024():
    """Create a new Pinecone index with 1024 dimensions."""
    
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
        
        # New index configuration
        index_name = "audiencelab-embeddings-1024"
        
        # Check if index already exists
        existing_indexes = pc.list_indexes()
        if any(index.name == index_name for index in existing_indexes):
            print(f"✅ Index '{index_name}' already exists!")
            return
        
        print(f"🔨 Creating new index: {index_name}")
        print(f"   Dimensions: 1024")
        print(f"   Metric: cosine")
        print(f"   Environment: {environment}")
        
        # Create the index
        pc.create_index(
            name=index_name,
            dimension=1024,
            metric="cosine",
            spec=pinecone.ServerlessSpec(
                cloud="gcp",
                region="us-central1"
            )
        )
        
        print(f"✅ Index '{index_name}' created successfully!")
        print(f"   You can now upload your 1024-dimensional embeddings to this index.")
        
    except Exception as e:
        print(f"❌ Error creating index: {str(e)}")

if __name__ == "__main__":
    create_index_1024() 