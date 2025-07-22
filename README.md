# Pinecone Audience Segments Uploader

This project sets up Pinecone for uploading 25,000 pre-embedded audience segments.

## Setup Instructions

### 1. Install Dependencies
```bash
pip3 install -r requirements.txt
```

### 2. Configure Environment Variables
Edit the `.env` file and add your Pinecone credentials:
```
PINECONE_API_KEY=your_actual_pinecone_api_key
PINECONE_ENV=your_actual_pinecone_environment
```

### 3. Initialize Pinecone
```bash
python3 pinecone_setup.py
```

## Testing the Environment

To test that your Pinecone environment is set up properly:

1. **Run the setup script**: `python3 pinecone_setup.py`
   - This will verify your credentials and list available indexes

2. **Check for successful output**:
   - ✅ Pinecone initialized successfully!
   - 📊 Environment: [your environment]
   - 📋 Available indexes: [list of your indexes]

3. **Common test scenarios**:
   - **Valid credentials**: Should show success message with environment and indexes
   - **Invalid API key**: Will show authentication error
   - **Wrong environment**: Will show connection error
   - **Missing .env file**: Will show missing credentials error

## Next Steps

Once the environment is confirmed working, you can:
1. Create or connect to an existing Pinecone index
2. Prepare your 25,000 audience segments data
3. Upload the embeddings to Pinecone

## Troubleshooting

- **"command not found: pip"**: Use `pip3` instead
- **Authentication errors**: Double-check your API key in the .env file
- **Environment errors**: Verify your Pinecone environment (e.g., "us-west1-gcp")
- **Missing indexes**: Create an index in your Pinecone console first 