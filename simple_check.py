import os
import csv
import json

def simple_check():
    """Simple check without pandas."""
    
    try:
        # Check if file exists
        if not os.path.exists("Spark_Matching_Segments_with_embeddings.csv"):
            print("❌ Spark_Matching_Segments_with_embeddings.csv file not found!")
            print("📁 Files in current directory:")
            for file in os.listdir("."):
                print(f"   {file}")
            return
        
        # Read CSV manually
        print("📖 Reading CSV file...")
        with open("Spark_Matching_Segments_with_embeddings.csv", 'r') as file:
            reader = csv.DictReader(file)
            rows = list(reader)
        
        print(f"📊 CSV Statistics:")
        print(f"   Total rows: {len(rows)}")
        if rows:
            print(f"   Columns: {list(rows[0].keys())}")
        
        # Check for required columns
        if rows:
            required_columns = ['embedding', 'topic', 'topic_ID']
            missing_columns = [col for col in required_columns if col not in rows[0]]
            
            if missing_columns:
                print(f"❌ Missing required columns: {missing_columns}")
                return
            
            print(f"✅ All required columns found!")
            
            # Check embedding format
            print(f"\n🔍 Checking embedding format...")
            sample_embedding = rows[0]['embedding']
            print(f"   Sample embedding type: {type(sample_embedding)}")
            print(f"   Sample embedding length: {len(str(sample_embedding))}")
            
            try:
                # Try to parse the first embedding
                parsed_embedding = json.loads(sample_embedding.replace("'", '"'))
                print(f"   ✅ Embedding can be parsed as JSON")
                print(f"   ✅ Embedding dimension: {len(parsed_embedding)}")
            except Exception as e:
                print(f"   ❌ Error parsing embedding: {str(e)}")
            
            # Show sample data
            print(f"\n📋 Sample data (first 3 rows):")
            for i in range(min(3, len(rows))):
                row = rows[i]
                print(f"   Row {i+1}:")
                print(f"     topic_ID: {row.get('topic_ID', 'N/A')}")
                print(f"     topic: {row.get('topic', 'N/A')}")
                print(f"     embedding: {str(row.get('embedding', 'N/A'))[:100]}...")
                print()
        
    except Exception as e:
        print(f"❌ Error reading CSV: {str(e)}")

if __name__ == "__main__":
    simple_check() 