# Intent-Based SPARK AI Chat Flow

## Overview

The SPARK AI chat interface has been simplified to provide a straightforward, step-by-step process for finding audience segments based on **intent and behavior** rather than personas or locations.

## How It Works

### 1. **Start a Conversation**
- Open the chat interface at `http://localhost:3000`
- Describe what you want to achieve (intent/behavior) in natural language
- Example: "I want to find people who need loans to grow their business"
- **Important**: Focus on WHAT people want to do, not WHO they are or WHERE they are

### 2. **AI Redirects to Intent (if needed)**
- If you mention personas (e.g., "small business owners") or locations (e.g., "North America"), the AI will redirect you to focus on intent
- The AI will ask about your goals and desired outcomes
- Example: "What is the main goal you want to achieve with cold email services?"

### 3. **AI Generates Intent-Based Queries**
- Once the AI understands your intent, it generates 3-5 optimized search queries
- Queries focus on behavior, goals, and desired outcomes
- Queries are displayed as numbered options (1, 2, 3, etc.)

### 4. **Select Your Query**
- Type the number of the query you want to use
- Example: Type "1" to select the first query

### 5. **Confirm Execution**
- The AI will show you the selected query and ask for confirmation
- Type "yes" to execute the search or "no" to cancel

### 6. **View Results**
- The system automatically searches the SPARK AI database
- Results show audience segments with similarity scores
- Each result includes topic name, score, segment ID, and method

## Example Flow

```
User: "I want to find small business owners in North America who need cold email services"

AI: "I understand you're looking for cold email services, but let's focus on what you want to achieve with those services instead of who or where. What is the main goal or outcome you want to achieve with cold email services? For example, are you looking to increase sales, generate leads, or improve customer engagement?"

User: "I need to increase sales"

AI: "Perfect! Based on your intent to increase sales through cold email services, here are some optimized search queries:

1. **Query:** "seeking cold email services to increase sales and revenue growth"
2. **Query:** "looking for cold email solutions to boost sales performance and lead generation"
3. **Query:** "wanting cold email marketing services to drive sales growth and customer acquisition"
4. **Query:** "searching for cold email strategies to maximize sales potential and business growth"
5. **Query:** "interested in cold email services to enhance sales outcomes and market reach"

Please select which query you'd like to use by typing the number (1-5)."

User: "1"

AI: "You selected: 'seeking cold email services to increase sales and revenue growth'

Are you sure you want to search with this query? Type 'yes' to confirm or 'no' to cancel."

User: "yes"

AI: "Found 3 audience segments for 'seeking cold email services to increase sales and revenue growth':

1. **Email Marketing Services** (Score: 0.857)
   Segment ID: segment_12345
   Method: semantic_search

2. **Sales Growth Strategies** (Score: 0.823)
   Segment ID: segment_67890
   Method: semantic_search

3. **Lead Generation Services** (Score: 0.791)
   Segment ID: segment_11111
   Method: semantic_search"
```

## Key Features

- **Intent-Focused**: Always redirects from WHO/WHERE to WHAT (intent/behavior)
- **Simple Number Selection**: No clicking required, just type numbers
- **Two-Step Confirmation**: Select query → Confirm execution
- **Direct Search**: Automatic connection to SPARK AI backend
- **Clear Results**: Easy-to-read format with scores and details
- **Error Handling**: Clear error messages if something goes wrong

## Technical Details

- **Frontend**: Next.js app on `http://localhost:3000`
- **Backend**: FastAPI server on `http://localhost:8000`
- **AI**: OpenAI GPT-4o-mini for intent-based query generation
- **Search**: SPARK AI with BAAI/bge-large-en-v1.5 embeddings
- **Focus**: Intent-based audience segment search (not persona or location-based)

## Getting Started

1. **Start the Backend**: `python3 api_server.py` (already running)
2. **Start the Frontend**: `cd ai-agent-app && npm run dev`
3. **Open Browser**: Go to `http://localhost:3000`
4. **Start Chatting**: Ask about audience segments!

## Troubleshooting

- **Backend Not Running**: Make sure `http://localhost:8000` is accessible
- **Frontend Issues**: Check that Next.js is running on port 3000
- **API Errors**: Verify your OpenAI API key is set in `.env.local`
- **No Results**: Try different search terms or be more specific

The intent-based flow makes it easy to find relevant audience segments based on what people want to achieve, not who they are or where they are located! 