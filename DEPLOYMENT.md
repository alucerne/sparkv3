# SPARK AI - Production Deployment Guide

## 🚀 Performance Optimizations Implemented

### 1. **Model Caching (Biggest Impact)**
- **Before**: Loading the 1.34GB BAAI/bge-large-en-v1.5 model on every request (~40 seconds)
- **After**: Load once at startup, cache in memory (~0.1-0.3 seconds per query)
- **Improvement**: ~99% faster response times

### 2. **Connection Pooling**
- **Before**: Creating new Pinecone connection on every request
- **After**: Reuse cached connection
- **Improvement**: Eliminates connection overhead

### 3. **Structured Data Return**
- **Before**: Print-only output
- **After**: Return structured data for API integration
- **Benefit**: Easy integration with web apps and services

### 4. **Performance Monitoring**
- **Added**: Detailed timing breakdown (embedding vs query time)
- **Added**: Throughput calculations
- **Added**: Production readiness assessment

## 📁 File Structure

```
SPARK AI/
├── main.py              # Original version (slow)
├── main_optimized.py    # Optimized version (fast)
├── api_server.py        # FastAPI web server
├── performance_test.py  # Performance benchmarking
├── requirements.txt     # Dependencies
└── DEPLOYMENT.md        # This file
```

## 🏃‍♂️ Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Up Environment Variables
Create a `.env` file:
```env
PINECONE_API_KEY=your_api_key_here
PINECONE_ENV=your_environment_here
```

### 3. Test Performance
```bash
python performance_test.py
```

### 4. Run Optimized Version
```bash
python main_optimized.py
```

### 5. Start API Server
```bash
python api_server.py
```

## 🌐 API Usage

### Start the server:
```bash
python api_server.py
```

### API Endpoints:

#### Health Check
```bash
curl http://localhost:8000/health
```

#### Search Segments
```bash
curl -X POST "http://localhost:8000/search" \
     -H "Content-Type: application/json" \
     -d '{"query": "learn digital marketing", "top_k": 5}'
```

#### Example Response:
```json
{
  "results": [
    {
      "topic": "Digital Marketing",
      "topic_id": "N/A",
      "score": 0.6894,
      "segment_id": "segment_17249"
    }
  ],
  "query": "learn digital marketing",
  "total_time": 0.234,
  "embedding_time": 0.164,
  "query_time": 0.070
}
```

## 📊 Performance Benchmarks

### Expected Performance:
- **First query**: ~0.5-1.0 seconds (includes model loading)
- **Subsequent queries**: ~0.1-0.3 seconds
- **Throughput**: 3-10 queries/second
- **Memory usage**: ~2-3GB (model + data)

### Production Recommendations:
- **CPU**: 4+ cores recommended
- **RAM**: 8GB+ recommended
- **Network**: Low latency to Pinecone
- **Concurrent users**: 10-50 depending on hardware

## 🔧 Production Deployment

### 1. **Docker Deployment**
Create `Dockerfile`:
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "api_server.py"]
```

### 2. **Docker Compose**
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  spark-ai:
    build: .
    ports:
      - "8000:8000"
    environment:
      - PINECONE_API_KEY=${PINECONE_API_KEY}
      - PINECONE_ENV=${PINECONE_ENV}
    restart: unless-stopped
```

### 3. **Environment Variables**
```bash
export PINECONE_API_KEY="your_key"
export PINECONE_ENV="your_env"
```

### 4. **Run with Docker**
```bash
docker-compose up -d
```

## 🚀 Advanced Optimizations

### 1. **Model Quantization**
For even faster inference:
```python
# In main_optimized.py, replace:
_model = SentenceTransformer("BAAI/bge-large-en-v1.5")

# With:
_model = SentenceTransformer("BAAI/bge-large-en-v1.5", device="cpu")
# Or for GPU:
_model = SentenceTransformer("BAAI/bge-large-en-v1.5", device="cuda")
```

### 2. **Caching Layer**
Add Redis for query caching:
```python
import redis
import hashlib
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def cached_search(query, top_k=5):
    # Create cache key
    cache_key = hashlib.md5(f"{query}_{top_k}".encode()).hexdigest()
    
    # Check cache
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Perform search
    results = find_matching_segments(query, top_k)
    
    # Cache for 1 hour
    redis_client.setex(cache_key, 3600, json.dumps(results))
    return results
```

### 3. **Load Balancing**
For high traffic, use multiple workers:
```bash
# Start multiple workers
uvicorn api_server:app --host 0.0.0.0 --port 8000 --workers 4
```

### 4. **Monitoring**
Add Prometheus metrics:
```python
from prometheus_client import Counter, Histogram, generate_latest

# Metrics
search_counter = Counter('searches_total', 'Total searches')
search_duration = Histogram('search_duration_seconds', 'Search duration')

@app.post("/search")
async def search_segments(request: SearchRequest):
    search_counter.inc()
    with search_duration.time():
        # ... existing search code
```

## 🔍 Troubleshooting

### Common Issues:

1. **Model Loading Slow**
   - First load takes ~40 seconds (normal)
   - Subsequent loads should be instant
   - Check available RAM (need 4GB+)

2. **Pinecone Connection Errors**
   - Verify API key and environment
   - Check network connectivity
   - Ensure index exists

3. **Memory Issues**
   - Model requires ~1.5GB RAM
   - Consider smaller model for production
   - Monitor memory usage

4. **Slow Response Times**
   - Run performance test to identify bottlenecks
   - Check CPU usage during queries
   - Consider GPU acceleration

## 📈 Scaling Strategies

### 1. **Horizontal Scaling**
- Deploy multiple API instances
- Use load balancer (nginx, HAProxy)
- Share Redis cache between instances

### 2. **Vertical Scaling**
- Increase CPU cores
- Add more RAM
- Use GPU acceleration

### 3. **Caching Strategy**
- Cache frequent queries
- Cache model embeddings
- Use CDN for static assets

### 4. **Database Optimization**
- Optimize Pinecone index settings
- Use appropriate metric (cosine, euclidean)
- Consider index partitioning

## 🎯 Production Checklist

- [ ] Performance test passed (< 1 second average)
- [ ] Environment variables configured
- [ ] Monitoring and logging set up
- [ ] Error handling implemented
- [ ] Security measures in place
- [ ] Backup and recovery plan
- [ ] Load testing completed
- [ ] Documentation updated

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Run performance tests
3. Review logs for errors
4. Verify environment configuration 