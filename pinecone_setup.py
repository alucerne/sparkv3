import os
import pinecone
from dotenv import load_dotenv

def initialize_pinecone():
    """
    Initialize Pinecone with credentials from .env file
    """
    # Load environment variables from .env file
    load_dotenv()
    
    # Get Pinecone credentials from environment variables
    api_key = os.getenv('PINECONE_API_KEY')
    environment = os.getenv('PINECONE_ENV')
    
    # Check if credentials are available
    if not api_key or not environment:
        print("❌ Error: Missing Pinecone credentials in .env file")
        print("Please ensure PINECONE_API_KEY and PINECONE_ENV are set in your .env file")
        return False
    
    if api_key == "your_pinecone_api_key_here" or environment == "your_pinecone_environment_here":
        print("❌ Error: Please update your .env file with actual Pinecone credentials")
        print("Replace the placeholder values with your real API key and environment")
        return False
    
    try:
        # Initialize Pinecone with new API
        pc = pinecone.Pinecone(api_key=api_key)
        
        # Test the connection by listing indexes
        indexes = pc.list_indexes()
        
        print("✅ Pinecone initialized successfully!")
        print(f"📊 Environment: {environment}")
        print(f"📋 Available indexes: {[index.name for index in indexes]}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error initializing Pinecone: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Initializing Pinecone...")
    success = initialize_pinecone()
    
    if success:
        print("\n🎉 Setup complete! Your Pinecone environment is ready for uploading audience segments.")
    else:
        print("\n⚠️  Setup incomplete. Please check your credentials and try again.") 