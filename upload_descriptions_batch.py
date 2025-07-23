import pandas as pd
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

# Supabase configuration
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_ANON_KEY')

if not url or not key:
    print("❌ Error: Missing Supabase credentials in .env file")
    print("Please add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file")
    exit(1)

# Initialize Supabase client
supabase: Client = create_client(url, key)

def upload_descriptions_batch(csv_file_path, batch_size=100):
    """Upload descriptions from CSV to Supabase in batches."""
    
    try:
        # Read the CSV file
        print(f"📖 Reading CSV file: {csv_file_path}")
        df = pd.read_csv(csv_file_path)
        
        print(f"📊 CSV Statistics:")
        print(f"   Total rows: {len(df)}")
        print(f"   Columns: {list(df.columns)}")
        
        # Auto-detect columns
        category_col = 'Catgeory'  # Your exact column name
        sub_category_col = 'Sub Category'
        topic_col = 'topic'
        topic_id_col = 'Topic _ID'
        topic_description_col = 'Topic Description'
        
        print(f"\n🔧 Using columns:")
        print(f"     Category: {category_col}")
        print(f"     Sub-Category: {sub_category_col}")
        print(f"     Topic: {topic_col}")
        print(f"     Topic ID: {topic_id_col}")
        print(f"     Topic Description: {topic_description_col}")
        
        # Process in batches
        total_rows = len(df)
        successful_uploads = 0
        failed_uploads = 0
        
        print(f"\n📤 Starting batch upload (batch size: {batch_size})...")
        
        for start_idx in range(0, total_rows, batch_size):
            end_idx = min(start_idx + batch_size, total_rows)
            batch_df = df.iloc[start_idx:end_idx]
            
            # Prepare batch data
            batch_data = []
            for idx, row in batch_df.iterrows():
                data = {
                    'topic': str(row[topic_col]) if pd.notna(row[topic_col]) else 'Unknown',
                    'topic_description': str(row[topic_description_col]) if pd.notna(row[topic_description_col]) else 'No description available'
                }
                
                if category_col and pd.notna(row[category_col]):
                    data['category'] = str(row[category_col])
                if sub_category_col and pd.notna(row[sub_category_col]):
                    data['sub_category'] = str(row[sub_category_col])
                if topic_id_col and pd.notna(row[topic_id_col]):
                    data['topic_id'] = str(row[topic_id_col])
                
                batch_data.append(data)
            
            try:
                # Upload batch to Supabase
                result = supabase.table('audience_descriptions').insert(batch_data).execute()
                successful_uploads += len(batch_data)
                print(f"   ✅ Batch {start_idx//batch_size + 1}: Uploaded {len(batch_data)} rows successfully")
                
                # Small delay to avoid rate limiting
                time.sleep(0.1)
                
            except Exception as e:
                failed_uploads += len(batch_data)
                print(f"   ❌ Batch {start_idx//batch_size + 1}: Failed to upload {len(batch_data)} rows - {str(e)}")
                continue
        
        print(f"\n📊 Upload Summary:")
        print(f"   ✅ Successfully uploaded: {successful_uploads} rows")
        print(f"   ❌ Failed uploads: {failed_uploads} rows")
        print(f"   📈 Success rate: {(successful_uploads/(successful_uploads+failed_uploads)*100):.1f}%")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    # Ask for CSV file path
    csv_path = input("Enter the path to your CSV file: ").strip()
    
    if not os.path.exists(csv_path):
        print(f"❌ Error: File not found: {csv_path}")
        exit(1)
    
    # Ask for batch size
    try:
        batch_size = int(input("Enter batch size (default 100): ") or "100")
    except ValueError:
        batch_size = 100
    
    upload_descriptions_batch(csv_path, batch_size) 