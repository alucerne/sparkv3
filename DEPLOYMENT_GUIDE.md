# SPARK AI Backend Deployment Guide

## 🚀 Deploy Your Pinecone-Powered Backend

Your SPARK AI backend uses Pinecone for vector storage and similarity search. Here are the best deployment options:

## Option 1: Railway (Recommended)

### Step 1: Prepare Your Repository
1. Ensure your code is pushed to GitHub
2. Make sure you have these files:
   - `Procfile` ✅
   - `runtime.txt` ✅
   - `requirements.txt` ✅
   - `api_server.py` ✅

### Step 2: Deploy to Railway
1. **Visit**: https://railway.app/
2. **Sign up** with GitHub
3. **Create New Project** → "Deploy from GitHub repo"
4. **Select your repository**: `alucerne/sparkv3`
5. **Set Root Directory**: Leave empty (deploy from root)
6. **Deploy**

### Step 3: Configure Environment Variables
In Railway dashboard:
1. Go to your project → Variables tab
2. Add these environment variables:
   ```
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_ENV=your_pinecone_environment
   ```
3. **Redeploy** the project

### Step 4: Get Your Backend URL
1. Railway will give you a URL like: `https://your-app.railway.app`
2. Copy this URL for the next step

## Option 2: Render (Alternative)

### Step 1: Deploy to Render
1. **Visit**: https://render.com/
2. **Sign up** with GitHub
3. **New Web Service** → Connect your GitHub repo
4. **Configure**:
   - **Name**: `spark-ai-backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn api_server:app --host 0.0.0.0 --port $PORT`
5. **Deploy**

### Step 2: Configure Environment Variables
Same as Railway - add PINECONE_API_KEY and PINECONE_ENV

## 🔗 Connect Frontend to Backend

### Step 1: Update Frontend Environment
In your Vercel project (`spark.audiencelab.io`):
1. Go to Vercel dashboard → Project Settings → Environment Variables
2. Add/Update:
   ```
   NEXT_PUBLIC_SPARK_API_URL=https://your-backend-url.railway.app
   ```
3. Redeploy frontend

### Step 2: Test the Connection
Visit: `https://spark.audiencelab.io/api/status`
Should show your backend URL as configured.

## 🔧 Environment Variables Required

### Backend (Railway/Render):
```
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENV=your_pinecone_environment
```

### Frontend (Vercel):
```
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SPARK_API_URL=https://your-backend-url.railway.app
```

## 🧪 Testing Your Deployment

### 1. Test Backend Health
```bash
curl https://your-backend-url.railway.app/
# Should return: {"message": "SPARK AI Audience Segment Search API", "status": "healthy"}
```

### 2. Test Search Endpoint
```bash
curl -X POST https://your-backend-url.railway.app/search \
  -H "Content-Type: application/json" \
  -d '{"query": "digital marketing", "top_k": 3}'
```

### 3. Test Frontend
Visit: `https://spark.audiencelab.io`
Try searching for audience segments.

## 🐛 Troubleshooting

### Common Issues:
- **"Pinecone connection failed"**: Check PINECONE_API_KEY and PINECONE_ENV
- **"Model loading error"**: Railway/Render may need more memory
- **"CORS errors"**: Backend should allow all origins (already configured)
- **"Timeout errors"**: First request may be slow due to model loading

### Performance Tips:
- Railway/Render will cache the model after first load
- Subsequent requests will be much faster
- Consider upgrading to paid tier for better performance

## 📊 Monitoring

### Railway:
- Built-in logs and monitoring
- Automatic restarts on crashes
- Easy scaling

### Render:
- Free tier has limitations
- Good for development/testing
- Upgrade for production use

## 🎯 Next Steps

1. **Deploy backend** to Railway or Render
2. **Configure environment variables**
3. **Update frontend** with backend URL
4. **Test the full system**
5. **Monitor performance** and scale as needed

Your SPARK AI system will be fully functional once both frontend and backend are deployed and connected! 