#!/usr/bin/env python3
"""
Test script to verify SPARK AI backend deployment and Pinecone connection.
Run this after deploying your backend to Railway/Render.
"""

import requests
import json
import sys
from typing import Optional

def test_backend_health(backend_url: str) -> bool:
    """Test if the backend is responding."""
    try:
        response = requests.get(f"{backend_url}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend Health Check: {data.get('message', 'Unknown')}")
            print(f"   Status: {data.get('status', 'Unknown')}")
            print(f"   Version: {data.get('version', 'Unknown')}")
            return True
        else:
            print(f"❌ Backend Health Check Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend Health Check Error: {str(e)}")
        return False

def test_search_endpoint(backend_url: str) -> bool:
    """Test the search endpoint with a sample query."""
    try:
        test_query = {
            "query": "digital marketing strategies",
            "top_k": 3
        }
        
        response = requests.post(
            f"{backend_url}/search",
            json=test_query,
            headers={"Content-Type": "application/json"},
            timeout=30  # Longer timeout for first model load
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Search Test Successful!")
            print(f"   Query: {data.get('query', 'Unknown')}")
            print(f"   Results: {len(data.get('results', []))} segments found")
            print(f"   Total Time: {data.get('total_time', 0):.2f}s")
            
            # Show first result
            if data.get('results'):
                first_result = data['results'][0]
                print(f"   Top Result: {first_result.get('topic', 'Unknown')} (Score: {first_result.get('score', 0):.3f})")
            
            return True
        else:
            print(f"❌ Search Test Failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Search Test Error: {str(e)}")
        return False

def main():
    """Main test function."""
    print("🧪 SPARK AI Backend Deployment Test")
    print("=" * 50)
    
    # Get backend URL from user
    if len(sys.argv) > 1:
        backend_url = sys.argv[1].rstrip('/')
    else:
        backend_url = input("Enter your backend URL (e.g., https://your-app.railway.app): ").strip().rstrip('/')
    
    if not backend_url:
        print("❌ No backend URL provided")
        sys.exit(1)
    
    print(f"🔗 Testing backend at: {backend_url}")
    print()
    
    # Test health endpoint
    print("1. Testing Health Endpoint...")
    health_ok = test_backend_health(backend_url)
    print()
    
    if not health_ok:
        print("❌ Backend health check failed. Please check your deployment.")
        sys.exit(1)
    
    # Test search endpoint
    print("2. Testing Search Endpoint...")
    print("   (This may take 30-60 seconds on first request due to model loading)")
    search_ok = test_search_endpoint(backend_url)
    print()
    
    # Summary
    print("=" * 50)
    if health_ok and search_ok:
        print("🎉 All tests passed! Your SPARK AI backend is working correctly.")
        print()
        print("📋 Next Steps:")
        print("1. Update your frontend environment variable:")
        print(f"   NEXT_PUBLIC_SPARK_API_URL={backend_url}")
        print("2. Redeploy your frontend on Vercel")
        print("3. Test the full system at: https://spark.audiencelab.io")
    else:
        print("❌ Some tests failed. Please check your deployment and try again.")
        if not health_ok:
            print("   - Backend may not be deployed correctly")
        if not search_ok:
            print("   - Pinecone connection or model loading may have issues")
    
    print()
    print("🔧 Troubleshooting:")
    print("- Check Railway/Render logs for errors")
    print("- Verify PINECONE_API_KEY and PINECONE_ENV are set")
    print("- Ensure your Pinecone index 'audiencelab-embeddings-1024' exists")

if __name__ == "__main__":
    main() 