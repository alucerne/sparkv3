import os
import pinecone
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
api_key = os.getenv('PINECONE_API_KEY')
environment = os.getenv('PINECONE_ENV')
index_name = "audiencelab-embeddings"

if not api_key or not environment:
    print("❌ Error: Missing Pinecone credentials in .env file.")
    exit(1)

try:
    # Initialize Pinecone
    pc = pinecone.Pinecone(api_key=api_key)
    index = pc.Index(index_name)

    # Delete all vectors
    print(f"Deleting all vectors from index: {index_name} ...")
    index.delete(delete_all=True)
    print(f"✅ All vectors deleted from index: {index_name}")
except Exception as e:
    print(f"❌ Error deleting vectors: {str(e)}") 