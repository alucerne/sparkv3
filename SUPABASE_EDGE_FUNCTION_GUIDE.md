# SPARK AI Supabase Edge Function Guide

## 🚀 Deploy SPARK AI as Supabase Edge Functions with Pinecone

This guide shows you how to deploy your SPARK AI backend as Supabase Edge Functions while keeping Pinecone for vector search.

## 🎯 Architecture

```
Frontend (spark.audiencelab.io) 
    ↓
Supabase Edge Functions
    ↓
Pinecone (Vector Search) + OpenAI (Embeddings)
```

## 📋 Prerequisites

1. **Supabase Account**: Sign up at https://supabase.com/
2. **Pinecone Account**: Your existing Pinecone setup
3. **OpenAI API Key**: For generating embeddings
4. **GitHub Repository**: Your code is already on GitHub

## 🛠️ Step 1: Set Up Supabase Project

### 1. Create Supabase Project
1. **Visit**: https://supabase.com/
2. **Sign up/Login** with GitHub
3. **Create New Project**
4. **Project Details**:
   - **Name**: `spark-ai-backend`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. **Create Project**

### 2. Get Project Reference
1. Go to **Settings** → **General**
2. Copy your **Project Reference** (e.g., `abcdefghijklmnop`)

## 🔧 Step 2: Install Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize Supabase in your project
supabase init

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF
```

## 🚀 Step 3: Deploy Edge Functions

### 1. Deploy Search Function
```bash
# Deploy the search function
supabase functions deploy spark-ai-search
```

### 2. Deploy Health Check Function
```bash
# Deploy the health check function
supabase functions deploy spark-ai-health
```

## 🔑 Step 4: Configure Environment Variables

### 1. Set Environment Variables in Supabase
```bash
# Set Pinecone credentials
supabase secrets set PINECONE_API_KEY=your_pinecone_api_key
supabase secrets set PINECONE_ENV=your_pinecone_environment
supabase secrets set PINECONE_INDEX=audiencelab-embeddings-1024

# Set OpenAI API key
supabase secrets set OPENAI_API_KEY=your_openai_api_key
```

### 2. Verify Environment Variables
```bash
# List all secrets
supabase secrets list
```

## 🔗 Step 5: Get Your Edge Function URLs

Your Edge Functions will be available at:
- **Search**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/spark-ai-search`
- **Health**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/spark-ai-health`

## 🔗 Step 6: Connect Frontend

### 1. Update Frontend Environment
In Vercel dashboard (`spark.audiencelab.io`):
1. **Settings** → **Environment Variables**
2. **Update**:
   ```
   NEXT_PUBLIC_SPARK_API_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/spark-ai-search
   ```

### 2. Test Connection
Visit: `https://spark.audiencelab.io/api/status`

## 🧪 Step 7: Testing

### 1. Test Health Endpoint
```bash
curl https://YOUR_PROJECT_REF.supabase.co/functions/v1/spark-ai-health
```

### 2. Test Search Endpoint
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/spark-ai-search \
  -H "Content-Type: application/json" \
  -d '{"query": "digital marketing", "top_k": 3}'
```

### 3. Test Frontend
Visit: `https://spark.audiencelab.io`

## 📊 Performance Benefits

### **Supabase Edge Functions:**
- **Global CDN**: Deployed to edge locations worldwide
- **Fast Cold Starts**: Optimized for serverless functions
- **Auto-scaling**: Handles traffic spikes automatically
- **Cost-effective**: Pay only for actual usage

### **Pinecone Integration:**
- **Keep Existing Data**: No migration needed
- **Same Performance**: Vector search remains fast
- **Familiar API**: Same Pinecone endpoints

## 🔧 Troubleshooting

### Common Issues:

1. **"Function not found"**
   - Ensure function is deployed: `supabase functions deploy spark-ai-search`
   - Check function name matches exactly

2. **"Environment variables not set"**
   - Verify secrets: `supabase secrets list`
   - Set missing variables: `supabase secrets set KEY=value`

3. **"Pinecone connection failed"**
   - Check PINECONE_API_KEY and PINECONE_ENV
   - Verify Pinecone index exists

4. **"OpenAI API error"**
   - Check OPENAI_API_KEY is set correctly
   - Verify OpenAI account has credits

### Debug Edge Functions:
```bash
# View function logs
supabase functions logs spark-ai-search

# Invoke function locally for testing
supabase functions serve spark-ai-search --env-file .env.local
```

## 📈 Monitoring

### Supabase Dashboard:
1. **Edge Functions** → View deployment status
2. **Logs** → Monitor function execution
3. **Usage** → Track function calls and performance

### Performance Metrics:
- **Response Time**: Usually < 500ms
- **Cold Start**: < 1 second
- **Success Rate**: Monitor for errors

## 🎯 Benefits of This Approach

1. **Best of Both Worlds**: Supabase Edge Functions + Pinecone Vector Search
2. **Global Performance**: Edge functions deployed worldwide
3. **Cost Effective**: Pay only for function calls
4. **Easy Scaling**: Automatic scaling with traffic
5. **Keep Existing Data**: No Pinecone migration needed
6. **Simple Deployment**: One command to deploy

## 📋 Next Steps

1. **Deploy Edge Functions** to Supabase
2. **Configure environment variables**
3. **Update frontend** with new API URL
4. **Test the full system**
5. **Monitor performance** and usage

Your SPARK AI will be running on Supabase Edge Functions with Pinecone vector search! 🎉

## 🔗 Useful Commands

```bash
# Deploy all functions
supabase functions deploy

# View function status
supabase functions list

# Update function code
supabase functions deploy spark-ai-search

# View logs
supabase functions logs spark-ai-search --follow

# Test locally
supabase functions serve --env-file .env.local
``` 