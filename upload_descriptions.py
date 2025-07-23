import pandas as pd
import os
from supabase import create_client, Client
from dotenv import load_dotenv

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

def upload_descriptions_from_csv(csv_file_path):
    """Upload descriptions from CSV to Supabase."""
    
    try:
        # Read the CSV file
        print(f"📖 Reading CSV file: {csv_file_path}")
        df = pd.read_csv(csv_file_path)
        
        print(f"📊 CSV Statistics:")
        print(f"   Total rows: {len(df)}")
        print(f"   Columns: {list(df.columns)}")
        
        # Display first few rows to understand structure
        print(f"\n📋 First 3 rows:")
        print(df.head(3))
        
        # Try to auto-detect columns
        category_col = None
        sub_category_col = None
        topic_col = None
        topic_id_col = None
        topic_description_col = None
        
        # Look for exact matches first, then similar names
        for col in df.columns:
            if col == 'Catgeory':  # Note the typo in your CSV
                category_col = col
            elif col == 'Sub Category':
                sub_category_col = col
            elif col == 'topic':
                topic_col = col
            elif col == 'Topic _ID':
                topic_id_col = col
            elif col == 'Topic Description':
                topic_description_col = col
        
        # If exact matches not found, try similar names
        if not category_col:
            for col in df.columns:
                col_lower = col.lower()
                if 'category' in col_lower and 'sub' not in col_lower:
                    category_col = col
                    break
        
        if not sub_category_col:
            for col in df.columns:
                col_lower = col.lower()
                if 'sub' in col_lower and 'category' in col_lower:
                    sub_category_col = col
                    break
        
        if not topic_col:
            for col in df.columns:
                col_lower = col.lower()
                if 'topic' in col_lower and 'id' not in col_lower and 'description' not in col_lower:
                    topic_col = col
                    break
        
        if not topic_id_col:
            for col in df.columns:
                col_lower = col.lower()
                if 'topic' in col_lower and 'id' in col_lower:
                    topic_id_col = col
                    break
        
        if not topic_description_col:
            for col in df.columns:
                col_lower = col.lower()
                if 'topic' in col_lower and 'description' in col_lower:
                    topic_description_col = col
                    break
        
        print(f"\n🔧 Auto-detected columns:")
        print(f"     Category: {category_col or 'NOT FOUND'}")
        print(f"     Sub-Category: {sub_category_col or 'NOT FOUND'}")
        print(f"     Topic: {topic_col or 'NOT FOUND'}")
        print(f"     Topic ID: {topic_id_col or 'NOT FOUND'}")
        print(f"     Topic Description: {topic_description_col or 'NOT FOUND'}")
        
        # If we don't have required columns, ask user
        if not topic_col:
            topic_col = input("Enter the column name for 'topic': ")
        if not topic_description_col:
            topic_description_col = input("Enter the column name for 'topic description': ")
        
        # Prepare data for upload
        upload_data = []
        for idx, row in df.iterrows():
            data = {
                'topic': str(row[topic_col]) if topic_col else 'Unknown',
                'topic_description': str(row[topic_description_col]) if topic_description_col else 'No description available'
            }
            
            if category_col:
                data['category'] = str(row[category_col]) if pd.notna(row[category_col]) else None
            if sub_category_col:
                data['sub_category'] = str(row[sub_category_col]) if pd.notna(row[sub_category_col]) else None
            if topic_id_col:
                data['topic_id'] = str(row[topic_id_col]) if pd.notna(row[topic_id_col]) else None
            
            upload_data.append(data)
        
        print(f"\n📤 Uploading {len(upload_data)} descriptions to Supabase...")
        
        # Upload to Supabase
        result = supabase.table('audience_descriptions').insert(upload_data).execute()
        
        print(f"✅ Successfully uploaded {len(upload_data)} descriptions!")
        print(f"📊 Result: {result}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    # Ask for CSV file path
    csv_path = input("Enter the path to your CSV file: ").strip()
    
    if not os.path.exists(csv_path):
        print(f"❌ Error: File not found: {csv_path}")
        exit(1)
    
    upload_descriptions_from_csv(csv_path) 