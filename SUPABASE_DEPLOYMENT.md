# SPARK AI with Supabase Deployment Guide

## 🚀 Deploy SPARK AI Using Supabase Instead of Pinecone

This guide shows you how to deploy SPARK AI using Supabase's PostgreSQL database with pgvector extension for vector similarity search.

## 🎯 Why Supabase?

### **Advantages:**
- **PostgreSQL Database**: Full relational database capabilities
- **pgvector Extension**: Native vector similarity search
- **Edge Functions**: Serverless Python deployment
- **Real-time**: Live updates and subscriptions
- **Auth**: Built-in authentication
- **Free Tier**: Generous limits
- **SQL Interface**: Familiar database operations

### **Architecture:**
```
Frontend (Vercel) → Supabase Edge Functions → Supabase PostgreSQL (pgvector)
```

## 📋 Prerequisites

1. **Supabase Account**: Sign up at https://supabase.com/
2. **GitHub Repository**: Your code is already on GitHub
3. **Pinecone Data**: Your existing audience segment data

## 🛠️ Step 1: Set Up Supabase Project

### 1. Create Supabase Project
1. **Visit**: https://supabase.com/
2. **Sign up/Login** with GitHub
3. **Create New Project**
4. **Choose Organization** (create one if needed)
5. **Project Details**:
   - **Name**: `spark-ai-backend`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
6. **Create Project**

### 2. Get Connection Details
1. Go to **Settings** → **Database**
2. Copy the **Connection string** (URI format)
3. Note your **Database password**

## 🗄️ Step 2: Enable pgvector Extension

### 1. Enable Vector Extension
1. Go to **SQL Editor** in Supabase dashboard
2. Run this SQL command:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### 2. Create Audience Segments Table
Run this SQL in the SQL Editor:
```sql
CREATE TABLE IF NOT EXISTS audience_segments (
    id SERIAL PRIMARY KEY,
    segment_id VARCHAR(255) UNIQUE NOT NULL,
    topic VARCHAR(500) NOT NULL,
    topic_id VARCHAR(255),
    description TEXT,
    embedding vector(1024),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vector index for similarity search
CREATE INDEX IF NOT EXISTS audience_segments_embedding_idx 
ON audience_segments 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

## 🔧 Step 3: Set Up Environment Variables

### 1. Get Supabase Connection String
Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

### 2. Set Environment Variables
For local development, create `.env` file:
```bash
SUPABASE_DB_URL=postgresql://postgres:your_password@db.your_project_ref.supabase.co:5432/postgres
OPENAI_API_KEY=your_openai_api_key
```

## 🚀 Step 4: Deploy Backend

### Option A: Supabase Edge Functions (Recommended)

#### 1. Install Supabase CLI
```bash
npm install -g supabase
```

#### 2. Initialize Supabase in Your Project
```bash
supabase init
```

#### 3. Link to Your Supabase Project
```bash
supabase link --project-ref your_project_ref
```

#### 4. Create Edge Function
```bash
supabase functions new spark-ai-search
```

#### 5. Deploy Edge Function
```bash
supabase functions deploy spark-ai-search
```

### Option B: Railway/Render with Supabase

#### 1. Deploy to Railway
1. **Visit**: https://railway.app/
2. **Connect GitHub** → Select `alucerne/sparkv3`
3. **Set Environment Variables**:
   ```
   SUPABASE_DB_URL=your_supabase_connection_string
   OPENAI_API_KEY=your_openai_api_key
   ```
4. **Deploy**

#### 2. Deploy to Render
1. **Visit**: https://render.com/
2. **New Web Service** → Connect GitHub repo
3. **Configure**:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn api_server_supabase:app --host 0.0.0.0 --port $PORT`
4. **Set Environment Variables** (same as Railway)
5. **Deploy**

## 📊 Step 5: Migrate Data from Pinecone

### 1. Export Pinecone Data
Run this script to export your existing data:
```bash
python export_pinecone_data.py
```

### 2. Import to Supabase
Run this script to import to Supabase:
```bash
python import_to_supabase.py
```

### 3. Verify Migration
```bash
python test_supabase_setup.py
```

## 🔗 Step 6: Connect Frontend

### 1. Update Frontend Environment
In Vercel dashboard (`spark.audiencelab.io`):
1. **Settings** → **Environment Variables**
2. **Update**:
   ```
   NEXT_PUBLIC_SPARK_API_URL=https://your-backend-url.railway.app
   # or for Edge Functions:
   NEXT_PUBLIC_SPARK_API_URL=https://your-project-ref.supabase.co/functions/v1/spark-ai-search
   ```

### 2. Test Connection
Visit: `https://spark.audiencelab.io/api/status`

## 🧪 Step 7: Testing

### 1. Test Backend Health
```bash
curl https://your-backend-url.railway.app/health
```

### 2. Test Search
```bash
curl -X POST https://your-backend-url.railway.app/search \
  -H "Content-Type: application/json" \
  -d '{"query": "digital marketing", "top_k": 3}'
```

### 3. Test Frontend
Visit: `https://spark.audiencelab.io`

## 📈 Performance Comparison

### Supabase vs Pinecone:

| Feature | Supabase | Pinecone |
|---------|----------|----------|
| **Setup** | ✅ Easy | ⚠️ Moderate |
| **Cost** | ✅ Free tier | ⚠️ Pay per query |
| **SQL Access** | ✅ Full SQL | ❌ No SQL |
| **Real-time** | ✅ Built-in | ❌ Limited |
| **Vector Search** | ✅ pgvector | ✅ Native |
| **Scalability** | ✅ Auto-scaling | ✅ Auto-scaling |

## 🔧 Troubleshooting

### Common Issues:

1. **"pgvector extension not found"**
   - Run: `CREATE EXTENSION IF NOT EXISTS vector;`

2. **"Connection refused"**
   - Check SUPABASE_DB_URL format
   - Verify database password

3. **"Vector dimension mismatch"**
   - Ensure embedding dimension is 1024 (BAAI/bge-large-en-v1.5)

4. **"Slow queries"**
   - Create proper vector index
   - Consider upgrading Supabase plan

## 🎯 Benefits of Supabase Migration

1. **Cost Savings**: Free tier vs Pinecone pricing
2. **SQL Flexibility**: Full database operations
3. **Real-time Features**: Live updates and subscriptions
4. **Better Integration**: Single platform for database + functions
5. **Familiar Interface**: PostgreSQL with pgvector

## 📋 Next Steps

1. **Set up Supabase project**
2. **Enable pgvector extension**
3. **Deploy backend** (Edge Functions or Railway)
4. **Migrate data** from Pinecone
5. **Update frontend** configuration
6. **Test full system**

Your SPARK AI will be running on Supabase with better performance and lower costs! 🎉 