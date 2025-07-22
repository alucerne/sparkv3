import os

def debug_csv():
    """Debug the CSV file to see what's actually in it."""
    
    filename = "Spark_Matching_Segments_with_embeddings.csv"
    
    if not os.path.exists(filename):
        print(f"❌ {filename} not found!")
        return
    
    print(f"📁 File info for {filename}:")
    print(f"   Size: {os.path.getsize(filename)} bytes")
    
    # Read the first few lines to see what's in the file
    print(f"\n📖 First 10 lines of the file:")
    try:
        with open(filename, 'r') as file:
            for i, line in enumerate(file):
                if i >= 10:  # Only show first 10 lines
                    break
                print(f"   Line {i+1}: {repr(line.strip())}")
    except Exception as e:
        print(f"❌ Error reading file: {str(e)}")
    
    # Check if file is empty
    if os.path.getsize(filename) == 0:
        print(f"\n❌ File is completely empty!")
        return
    
    # Try to read as text and show first 500 characters
    print(f"\n📄 First 500 characters of file content:")
    try:
        with open(filename, 'r') as file:
            content = file.read(500)
            print(f"   {repr(content)}")
    except Exception as e:
        print(f"❌ Error reading content: {str(e)}")

if __name__ == "__main__":
    debug_csv() 