# SPARK AI + Claude Chat Interface

A modern chat interface that combines SPARK AI's intent-based audience segment search with Claude AI's conversational capabilities.

## Features

- **Dual AI Integration**: SPARK AI for audience segment search + Claude AI for general conversation
- **Smart Query Routing**: Automatically detects whether to use SPARK AI or Claude AI
- **Expert Query Generation**: Claude AI generates optimized semantic search queries for BAAI/bge-large-en-v1.5
- **Real-time Search**: Fast audience segment discovery with semantic search
- **Modern UI**: Clean, responsive design with Tailwind CSS

## Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.8+ (for SPARK AI backend)
- Claude API key

### Installation

1. **Clone and install dependencies:**
```bash
cd ai-agent-app
npm install
```

2. **Set up environment variables:**
```bash
# Create .env.local file
echo "CLAUDE_API_KEY=your-claude-api-key-here" > .env.local
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Start SPARK AI backend** (in another terminal):
```bash
cd ..
python3 api_server_optimized.py
```

5. **Open your browser:**
```
http://localhost:3000
```

## How It Works

### Smart Query Routing

The system automatically routes your queries:

- **Audience Segment Queries** → Claude (interactive query generation) → User Approval → SPARK AI (search execution)
- **General Questions** → Claude (conversation and assistance)

### Claude AI Query Generation

Claude AI is configured as an **interactive expert semantic search query generator** for BAAI/bge-large-en-v1.5 embeddings:

- **Natural Conversation**: Asks one question at a time for natural flow
- **Conversation Memory**: Remembers previous answers and builds on them
- **Targeted Queries**: Generates 3-5 optimized queries based on detailed context
- **User Approval**: User can click on specific queries to execute searches
- **Implementation Guidance**: Provides best practices and reminders

### Example Workflow

1. **User**: "I want to find people interested in sustainable fashion"
2. **Claude**: "I'd like to help you find the right audience segments! To start, are you looking for consumers who buy sustainable fashion, or professionals working in the sustainable fashion industry?"
3. **User**: "Consumers who buy sustainable fashion"
4. **Claude**: "Thanks! Let me understand the age range you're targeting. Are you primarily interested in younger consumers (like Gen Z and Millennials), or are you looking for a broader age range?"
5. **User**: "Younger consumers like Gen Z and Millennials"
6. **Claude**: "Great! Now I'd like to understand the geographic focus. Are you looking for consumers in any specific country or region, or is this for a global audience?"
7. **User**: "North America"
8. **Claude**: Generates optimized queries:
   ```
   1. "Query: Gen Z and Millennial consumers in North America who actively purchase sustainable and eco-friendly fashion brands, prioritizing environmental impact in their clothing choices"
   2. "Query: young fashion-conscious shoppers aged 18-35 in North America seeking ethical clothing brands, sustainable materials, and environmentally responsible fashion options"
   3. "Query: North American Gen Z and Millennial sustainable fashion enthusiasts who follow eco-friendly clothing trends, shop from ethical brands, and care about reducing fashion waste"
   ```
9. **User**: Clicks on specific queries to execute searches
10. **SPARK AI**: Executes semantic search with approved queries
11. **Results**: Returns relevant audience segments

### Performance Benefits

- **Faster Response**: Claude generates queries quickly without waiting for SPARK AI
- **User Control**: Users can choose which queries to execute
- **Better Targeting**: Interactive questioning leads to more precise queries
- **Reduced Load**: Only approved queries are sent to SPARK AI

## API Endpoints

### SPARK AI Search
- **URL**: `http://localhost:8000/search`
- **Method**: POST
- **Body**: `{ "query": "search term", "top_k": 5 }`

### Claude AI Query Generation
- **URL**: `/api/claude`
- **Method**: POST
- **Body**: `{ "prompt": "search intent description" }`

## Configuration

### Environment Variables

Create a `.env.local` file in the `ai-agent-app` directory:

```bash
# Claude API Configuration
CLAUDE_API_KEY=sk-ant-your-actual-api-key-here
```

### SPARK AI Backend

The SPARK AI backend uses:
- **Model**: BAAI/bge-large-en-v1.5 embeddings
- **Database**: Pinecone vector database
- **Port**: 8000

## Troubleshooting

### Common Issues

1. **"next: command not found"**
   ```bash
   npm install
   ```

2. **"Module not found" errors**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Port 8000 already in use**
   ```bash
   # Kill existing process
   lsof -ti:8000 | xargs kill -9
   ```

4. **Input text not visible**
   - The input field has been fixed with explicit styling
   - Text should now be clearly visible with dark text on white background
   - If still having issues, check browser console for CSS errors

5. **Claude API errors**
   - Verify your API key is correct
   - Check the `CLAUDE_SETUP.md` file for detailed setup instructions

### Development

- **Frontend**: `http://localhost:3000`
- **SPARK AI Backend**: `http://localhost:8000`
- **Hot Reload**: Enabled for both frontend and backend

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Input    │───▶│  Query Router   │───▶│  SPARK AI       │
│                 │    │                 │    │  (Search)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  Claude AI      │
                       │  (Query Gen)    │
                       └─────────────────┘
```

## Technologies

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python, BAAI/bge-large-en-v1.5, Pinecone
- **AI**: Claude 3.5 Sonnet (Anthropic)
- **UI Components**: ShadCN UI, Kibo UI

## License

MIT License
