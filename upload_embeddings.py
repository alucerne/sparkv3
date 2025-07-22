import os
import pandas as pd
import numpy as np
import pinecone
from dotenv import load_dotenv
from google.cloud import storage
import json
from tqdm import tqdm

def download_from_gcs(bucket_name, source_blob_name, destination_file_name):
    """Download a file from Google Cloud Storage."""
    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(source_blob_name)
        
        print(f"📥 Downloading {source_blob_name} from GCS...")
        blob.download_to_filename(destination_file_name)
        print(f"✅ Downloaded to {destination_file_name}")
    except Exception as e:
        print(f"❌ Error downloading from GCS: {str(e)}")
        print("💡 Make sure you're authenticated with: gcloud auth application-default login")
        raise

def upload_to_pinecone(index, vectors_batch, batch_size=100):
    """Upload vectors to Pinecone in batches."""
    total_vectors = len(vectors_batch)
    print(f"📤 Uploading {total_vectors} vectors to Pinecone...")
    
    successful_uploads = 0
    for i in tqdm(range(0, total_vectors, batch_size), desc="Uploading batches"):
        batch = vectors_batch[i:i + batch_size]
        try:
            result = index.upsert(vectors=batch)
            successful_uploads += len(batch)
            print(f"   Batch {i//batch_size + 1}: Uploaded {len(batch)} vectors successfully")
        except Exception as e:
            print(f"❌ Error uploading batch {i//batch_size + 1}: {str(e)}")
            continue
    
    print(f"✅ Upload completed! Successfully uploaded {successful_uploads} out of {total_vectors} vectors")

def main():
    # Load environment variables
    load_dotenv()
    api_key = os.getenv('PINECONE_API_KEY')
    environment = os.getenv('PINECONE_ENV')
    
    if not api_key or not environment:
        print("❌ Error: Missing Pinecone credentials in .env file")
        return
    
    # GCS file details
    bucket_name = "segments_embedding"
    source_blob_name = "embedding_output/Spark_Matching_Segments_with_embeddings.csv"
    local_file = "Spark_Matching_Segments_with_embeddings.csv"
    
    # Pinecone index details
    index_name = "audiencelab-embeddings-1024"
    
    try:
        # Download file from GCS
        download_from_gcs(bucket_name, source_blob_name, local_file)
        
        # Read the CSV file
        print("📖 Reading CSV file...")
        df = pd.read_csv(local_file)
        print(f"📊 Loaded {len(df)} records")
        print(f"📋 Columns: {list(df.columns)}")
        
        # Initialize Pinecone
        print("🔗 Connecting to Pinecone...")
        pc = pinecone.Pinecone(api_key=api_key)
        index = pc.Index(index_name)
        
        # Prepare vectors for upload
        print("🔄 Preparing vectors for upload...")
        vectors = []
        
        for idx, row in df.iterrows():
            # Extract embedding vector
            embedding_str = row.get('embedding', '')
            if not embedding_str:
                print(f"⚠️  Skipping row {idx}: No embedding found")
                continue
                
            try:
                # Parse embedding string to list of floats
                embedding = json.loads(embedding_str.replace("'", '"'))
                
                # Create vector ID using topic_ID if available, otherwise use index
                vector_id = str(row.get('topic_ID', f"segment_{idx}"))
                
                # Prepare metadata with topic and topic_ID
                metadata = {}
                if 'topic' in row and pd.notna(row['topic']):
                    metadata['topic'] = str(row['topic'])
                if 'topic_ID' in row and pd.notna(row['topic_ID']):
                    metadata['topic_ID'] = str(row['topic_ID'])
                
                # Add to vectors list with metadata
                vectors.append((vector_id, embedding, metadata))
                
            except Exception as e:
                print(f"⚠️  Skipping row {idx}: Could not parse embedding - {str(e)}")
                continue
        
        print(f"✅ Prepared {len(vectors)} vectors for upload")
        
        # Upload to Pinecone
        upload_to_pinecone(index, vectors)
        
        # Don't clean up the file since it already exists
        print(f"✅ Upload completed! File {local_file} remains for future use")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        if os.path.exists(local_file):
            os.remove(local_file)

if __name__ == "__main__":
    main() 