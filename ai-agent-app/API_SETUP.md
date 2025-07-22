# API Setup Guide

## OpenAI API Key Setup

### 1. Get Your API Key
1. Visit: https://platform.openai.com/api-keys
2. Sign in to your OpenAI account
3. Click "Create new secret key"
4. Name it (e.g., "SPARK AI Project")
5. Copy the key (starts with `sk-`)

### 2. Set Up Environment Variables

#### For Vercel Deployment:
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key
4. Save and redeploy

#### For Local Development:
1. Create `.env.local` file in `ai-agent-app/` directory
2. Add your API key:
   ```
   OPENAI_API_KEY=sk-your_actual_key_here
   NEXT_PUBLIC_SPARK_API_URL=http://localhost:8000
   ```

### 3. Test Your Setup
1. Start your backend: `python3 api_server.py`
2. Start frontend: `cd ai-agent-app && npm run dev`
3. Open http://localhost:3000
4. Try asking a question to test the API

## Optional: Claude API Setup

If you want to use Claude features:

### 1. Get Claude API Key
1. Visit: https://console.anthropic.com/
2. Sign up/login to Anthropic
3. Go to API Keys section
4. Create new key

### 2. Add to Environment
- **Vercel**: Add `CLAUDE_API_KEY` environment variable
- **Local**: Add to `.env.local` file

## Troubleshooting

### Common Issues:
- **"API key not found"**: Check environment variable name and value
- **"Rate limited"**: Wait a few minutes or upgrade your OpenAI plan
- **"Invalid API key"**: Verify the key starts with `sk-` and is complete

### Security Best Practices:
- Never commit API keys to Git
- Use environment variables in production
- Rotate keys regularly
- Monitor usage in OpenAI dashboard

## Cost Management

- OpenAI charges per token used
- Monitor usage at: https://platform.openai.com/usage
- Set up billing alerts in OpenAI dashboard
- Consider usage limits for production apps 