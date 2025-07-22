# Claude API Setup Guide

## Required Configuration

To enable Claude AI interactions in your SPARK AI chat interface, you need to set up your Claude API key.

### Step 1: Get Your Claude API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy the API key (it starts with `sk-ant-`)

### Step 2: Configure Environment Variables

Create a `.env.local` file in the root of your `ai-agent-app` directory:

```bash
# Claude API Configuration
CLAUDE_API_KEY=sk-ant-your-actual-api-key-here
```

### Step 3: Restart the Development Server

After adding the environment variable, restart your Next.js development server:

```bash
npm run dev
```

### Step 4: Test the Integration

The Claude API is now integrated into your chat interface as an interactive expert semantic search query generator.

## API Endpoint

The Claude API is available at: `POST /api/claude`

**Request Body:**
```json
{
  "prompt": "Your search intent or topic"
}
```

**Response:**
```json
{
  "text": "Interactive questions or generated optimized search queries with implementation guidance"
}
```

## System Prompt

Claude is configured as an **interactive expert semantic search query generator** specifically trained for BAAI/bge-large-en-v1.5 embeddings:

### Core Functionality
- **Role**: Interactive expert semantic search query generator
- **Specialization**: BAAI/bge-large-en-v1.5 embeddings optimization
- **Process**: Ask clarifying questions → Generate optimized queries → Provide implementation guidance
- **Output**: 3-5 optimized search queries with "Query:" prefix

### Interactive Process

#### Step 1: Ask Clarifying Questions
When a user provides a search intent, Claude asks 2-3 specific questions to better understand:
- **Target Audience**: Who exactly are they looking for? (age, profession, interests, behavior)
- **Geographic Scope**: Any specific locations or regions?
- **Intent/Behavior**: What are these people trying to do or achieve?
- **Industry Context**: What business context or industry is this for?

#### Step 2: Generate Optimized Queries
Once enough information is gathered, Claude generates 3-5 optimized English search queries with "Query:" prefix following BAAI/bge-large-en-v1.5 best practices.

#### Step 3: Provide Implementation Guidance
After generating queries, Claude provides brief reminders about:
- Using BAAI/bge-large-en-v1.5 for encoding
- L2-normalization of vectors
- Cosine similarity for comparison
- Reviewing and refining results

### Example Interaction

**User**: "I want to find people interested in sustainable fashion"

**Claude Response**:
```
I'll help you find the most relevant audience segments. First, I need some clarifying details:

1. Are you looking for specific types of consumers (e.g., luxury shoppers, budget-conscious buyers, fashion professionals, influencers) or a particular age group?

2. Are you focusing on any specific geographic markets (e.g., North America, Europe, global)?

3. What's your business objective? (e.g., launching a sustainable fashion brand, marketing existing products, market research, partnerships)

Once you provide these details, I can generate more targeted and effective search queries for your needs.
```

**User Follow-up**: "I am looking for consumers aged 25-40 in North America, and my business objective is launching a sustainable fashion brand."

**Claude Response**:
```
Thank you for providing those details! Here are optimized search queries for BAAI/bge-large-en-v1.5:

1. "Query: North American millennials and young professionals aged 25-40 who actively purchase sustainable and eco-friendly fashion brands, demonstrating strong environmental consciousness in their clothing choices"

2. "Query: fashion-conscious consumers in USA and Canada between 25-40 years old who follow sustainable fashion influencers, engage with ethical fashion content, and are willing to pay premium prices for environmentally responsible clothing"

3. "Query: urban professionals in North American cities aged 25-40 who prioritize sustainability in their wardrobe decisions, regularly research eco-friendly fashion brands, and share their sustainable fashion discoveries on social media"

Implementation Reminders:
- Use BAAI/bge-large-en-v1.5 for encoding these queries
- Apply L2-normalization to the resulting vectors
- Use cosine similarity for comparing vectors
- Consider testing different queries and analyzing which produces the most relevant results
```

## Model Configuration

- **Model**: `claude-3-5-sonnet-20241022`
- **Max Tokens**: 1000
- **Temperature**: 0.7
- **System Prompt**: Interactive expert semantic search query generation for BAAI/bge-large-en-v1.5

## Integration Features

### Smart Query Routing
The chat interface automatically routes queries:
- **Audience segment search requests** → Claude (interactive query generation) → SPARK AI (search execution)
- **General questions** → Claude (conversation and assistance)

### Interactive Workflow
1. **User Input**: Describes search intent or topic
2. **Claude Questions**: Asks **one question at a time** to understand context
3. **User Response**: Provides answer to the specific question
4. **Conversation Memory**: Claude remembers previous answers and builds on them
5. **Query Generation**: Claude generates 3-5 optimized queries when sufficient info is gathered
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
- **Claude AI**: Purple badge with bot icon (interactive query generation)

### Key Benefits
- **Better Query Quality**: Natural conversation leads to more targeted queries
- **Improved Results**: More specific queries yield better audience segment matches
- **User Education**: Implementation guidance helps users understand the process
- **Conversational UX**: Natural back-and-forth interaction
- **Performance**: Faster response times with user-controlled search execution
- **Efficiency**: Only approved queries are sent to SPARK AI, reducing unnecessary load
- **Natural Flow**: One question at a time feels like talking to a real person

You can modify the system prompt in `src/app/api/claude/route.ts` if needed. 