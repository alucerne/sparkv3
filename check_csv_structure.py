import pandas as pd
import sys

def check_csv_structure(csv_file_path):
    """Check the structure of the CSV file to diagnose issues."""
    
    try:
        # Read the CSV file
        print(f"📖 Reading CSV file: {csv_file_path}")
        df = pd.read_csv(csv_file_path)
        
        print(f"\n📊 CSV Structure Analysis:")
        print(f"   Total rows: {len(df)}")
        print(f"   Total columns: {len(df.columns)}")
        print(f"   Column names: {list(df.columns)}")
        
        # Check for exact matches
        expected_columns = ['Category', 'Sub-category', 'Topic', 'Topic ID', 'Topic Description']
        found_columns = []
        
        print(f"\n🔍 Column Matching:")
        for expected in expected_columns:
            if expected in df.columns:
                found_columns.append(expected)
                print(f"   ✅ Found: {expected}")
            else:
                print(f"   ❌ Missing: {expected}")
        
        # Check for similar column names
        print(f"\n🔍 Similar Column Names:")
        for col in df.columns:
            col_lower = col.lower()
            if 'category' in col_lower:
                print(f"   📋 Category-like: '{col}'")
            elif 'topic' in col_lower:
                print(f"   📋 Topic-like: '{col}'")
            elif 'description' in col_lower:
                print(f"   📋 Description-like: '{col}'")
        
        # Show first few rows
        print(f"\n📋 First 3 rows:")
        print(df.head(3).to_string())
        
        # Check for data types and null values
        print(f"\n📊 Data Types:")
        for col in df.columns:
            null_count = df[col].isnull().sum()
            data_type = df[col].dtype
            print(f"   {col}: {data_type} (nulls: {null_count})")
        
        # Check for special characters or encoding issues
        print(f"\n🔍 Data Quality Check:")
        for col in df.columns:
            sample_values = df[col].dropna().head(3).tolist()
            print(f"   {col} sample values: {sample_values}")
        
        return df
        
    except Exception as e:
        print(f"❌ Error reading CSV: {str(e)}")
        return None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        csv_path = sys.argv[1]
    else:
        csv_path = input("Enter the path to your CSV file: ").strip()
    
    check_csv_structure(csv_path) 