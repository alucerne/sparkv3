import pandas as pd
import json

def check_csv():
    """Check the CSV file structure and content."""
    
    try:
        # Read the CSV file
        print("📖 Reading CSV file...")
        df = pd.read_csv("embeddings.csv")
        
        print(f"📊 CSV Statistics:")
        print(f"   Total rows: {len(df)}")
        print(f"   Columns: {list(df.columns)}")
        print(f"   Memory usage: {df.memory_usage(deep=True).sum() / 1024 / 1024:.2f} MB")
        
        # Check for required columns
        required_columns = ['embedding', 'topic', 'topic_ID']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            print(f"❌ Missing required columns: {missing_columns}")
            return
        
        print(f"✅ All required columns found!")
        
        # Check embedding format
        print(f"\n🔍 Checking embedding format...")
        sample_embedding = df['embedding'].iloc[0]
        print(f"   Sample embedding type: {type(sample_embedding)}")
        print(f"   Sample embedding length: {len(str(sample_embedding))}")
        
        try:
            # Try to parse the first embedding
            parsed_embedding = json.loads(sample_embedding.replace("'", '"'))
            print(f"   ✅ Embedding can be parsed as JSON")
            print(f"   ✅ Embedding dimension: {len(parsed_embedding)}")
        except Exception as e:
            print(f"   ❌ Error parsing embedding: {str(e)}")
        
        # Check for null values
        print(f"\n🔍 Checking for null values...")
        null_counts = df.isnull().sum()
        print(f"   Null values per column:")
        for col, count in null_counts.items():
            print(f"     {col}: {count}")
        
        # Show sample data
        print(f"\n📋 Sample data (first 3 rows):")
        for i in range(min(3, len(df))):
            row = df.iloc[i]
            print(f"   Row {i+1}:")
            print(f"     topic_ID: {row.get('topic_ID', 'N/A')}")
            print(f"     topic: {row.get('topic', 'N/A')}")
            print(f"     embedding: {str(row.get('embedding', 'N/A'))[:100]}...")
            print()
        
    except Exception as e:
        print(f"❌ Error reading CSV: {str(e)}")

if __name__ == "__main__":
    check_csv() 