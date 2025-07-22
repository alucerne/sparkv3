# Vercel Deployment Guide

## Custom Domain: spark.audiencelab.io

Your SPARK AI application is deployed at: **https://spark.audiencelab.io**

## Environment Variables Required

Add these environment variables in your Vercel project settings:

### Required Variables:
- `OPENAI_API_KEY` - Your OpenAI API key
- `NEXT_PUBLIC_SPARK_API_URL` - URL of your SPARK AI backend (e.g., `https://your-backend.vercel.app` or `http://localhost:8000` for local development)

### Optional Variables:
- `CLAUDE_API_KEY` - Your Claude API key (if using Claude features)

## Setup Steps:

1. **Import to Vercel**: Import your GitHub repository to Vercel
2. **Set Environment Variables**: Go to Project Settings → Environment Variables
3. **Add Variables**: Add the required environment variables above
4. **Deploy**: Vercel will automatically deploy your app

## Common Issues:

### 404 Error
- Ensure all environment variables are set
- Check that the build completes successfully
- Verify API routes are properly configured

### Build Failures
- Make sure all dependencies are in `package.json`
- Check that TypeScript compilation passes
- Verify Next.js configuration is correct

## Backend Deployment

For the SPARK AI backend, you can:
1. Deploy to Vercel as a separate project
2. Use Railway, Render, or similar services
3. Keep running locally for development

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
``` 