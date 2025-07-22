# OpenAI API Setup Guide

## Required Configuration

To enable OpenAI interactions in your SPARK AI chat interface, you need to set up your OpenAI API key.

### Step 1: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy the API key (it starts with `sk-`)

### Step 2: Configure Environment Variables

Create or update your `.env.local` file in the root of your `ai-agent-app` directory:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-your-actual-api-key-here

# Optional: Customize OpenAI settings
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_RETRIES=3
OPENAI_RATE_LIMIT_REQUESTS=20
OPENAI_RATE_LIMIT_WINDOW=60000
```

### Step 3: Restart the Development Server

After adding the environment variable, restart your Next.js development server:

```bash
npm run dev
```

### Step 4: Test the Integration

The OpenAI API is now integrated into your chat interface as an interactive expert semantic search query generator.

## API Endpoint

The OpenAI API is available at: `POST /api/openai`

**Request Body:**
```json
{
  "prompt": "Your search intent or topic",
  "conversationHistory": []
}
```

**Response:**
```json
{
  "text": "Interactive questions or generated optimized search queries with implementation guidance"
}
```

## Model Configuration

- **Model**: `gpt-4o-mini` (fast and cost-effective)
- **Max Tokens**: 1000
- **Temperature**: 0.7
- **System Prompt**: Interactive expert semantic search query generation for BAAI/bge-large-en-v1.5

## Integration Features

### Smart Query Routing
The chat interface automatically routes queries:
- **Audience segment search requests** → OpenAI (interactive query generation) → SPARK AI (search execution)
- **General questions** → OpenAI (conversation and assistance)

### Interactive Workflow
1. **User Input**: Describes search intent or topic
2. **OpenAI Questions**: Asks **one question at a time** to understand context
3. **User Response**: Provides answer to the specific question
4. **Conversation Memory**: OpenAI remembers previous answers and builds on them
5. **Query Generation**: OpenAI generates 3-5 optimized queries when sufficient info is gathered
6. **User Approval**: User clicks on specific queries to execute searches
7. **SPARK AI Search**: Executes semantic search with approved queries
8. **Results**: Returns relevant audience segments

### Conversation Features
- **Natural Flow**: One question at a time for better conversation
- **Memory**: Remembers previous answers and doesn't repeat questions
- **Contextual**: Builds on previous responses naturally
- **Conversational**: Friendly, not robotic interaction style
- **Efficient**: Moves to query generation when sufficient info is gathered

### Visual Indicators
- **SPARK AI**: Blue badge with sparkles icon (search execution)
- **OpenAI**: Purple badge with bot icon (interactive query generation)

### Key Benefits
- **Better Query Quality**: Natural conversation leads to more targeted queries
- **Improved Results**: More specific queries yield better audience segment matches
- **User Education**: Implementation guidance helps users understand the process
- **Conversational UX**: Natural back-and-forth interaction
- **Performance**: Faster response times with user-controlled search execution
- **Efficiency**: Only approved queries are sent to SPARK AI, reducing unnecessary load
- **Natural Flow**: One question at a time feels like talking to a real person
- **Stability**: OpenAI API is generally more stable than Claude API

## OpenAI API Limits

### Standard Rate Limits
- **Requests per minute**: 3,000 requests per minute (much higher than Claude)
- **Requests per hour**: 100,000 requests per hour
- **Concurrent requests**: 10 concurrent requests

### Model-Specific Limits
- **GPT-4o-mini**: 3,000 requests/minute
- **GPT-4o**: 500 requests/minute
- **GPT-3.5-turbo**: 3,500 requests/minute

### Token Limits
- **Input tokens**: 128,000 tokens per request
- **Output tokens**: 4,096 tokens per request (default)
- **Total tokens**: 128,000 tokens per request

## Error Handling

The system includes comprehensive error handling for:
- **Rate Limiting (429)**: Automatic retry with exponential backoff
- **Server Errors (500/502/503)**: Retry with backoff
- **Authentication Errors (401)**: Clear error messages
- **Network Errors**: Retry with exponential backoff

## Configuration Options

### Environment Variables
```bash
# Required
OPENAI_API_KEY=sk-your-api-key

# Optional
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_RETRIES=3
OPENAI_RATE_LIMIT_REQUESTS=20
OPENAI_RATE_LIMIT_WINDOW=60000
```

### Model Options
- `gpt-4o-mini`: Fast, cost-effective (recommended)
- `gpt-4o`: More capable, slightly slower
- `gpt-3.5-turbo`: Fastest, good for simple tasks

## Cost Considerations

### GPT-4o-mini Pricing (Recommended)
- **Input**: $0.15 per 1M tokens
- **Output**: $0.60 per 1M tokens
- **Typical query generation**: ~$0.001-0.005 per request

### Cost Optimization
- Use `gpt-4o-mini` for most tasks
- Set appropriate `max_tokens` limits
- Implement caching for repeated queries
- Monitor usage in OpenAI dashboard

You can modify the system prompt in `src/app/api/openai/route.ts` if needed. 