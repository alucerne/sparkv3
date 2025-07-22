# Claude API Overload Protection

This document explains the comprehensive overload protection and retry mechanisms implemented to handle Claude API service issues.

## Features Implemented

### 1. **Exponential Backoff Retry Logic**
- **Max Retries**: 3 attempts (configurable)
- **Base Delay**: 1 second
- **Max Delay**: 10 seconds
- **Backoff Multiplier**: 2x (exponential increase)

### 2. **Rate Limiting**
- **Requests per Window**: 10 requests per minute (configurable)
- **Window Size**: 60 seconds (configurable)
- **In-Memory Storage**: Simple rate limiter (use Redis in production)

### 3. **Smart Error Handling**
- **529 Overload Errors**: Automatic retry with exponential backoff
- **429 Rate Limit Errors**: Respect `retry-after` headers
- **Network Errors**: Retry with backoff
- **Model Fallback**: Automatic fallback to base model if specific model unavailable

### 4. **Configuration Management**
All settings are configurable via environment variables:

```bash
# Retry Configuration
CLAUDE_MAX_RETRIES=3
CLAUDE_RATE_LIMIT_REQUESTS=10
CLAUDE_RATE_LIMIT_WINDOW=60000
```

## How It Works

### Retry Flow
1. **Initial Request**: Attempt to call Claude API
2. **529 Error**: If overloaded, wait and retry with exponential backoff
3. **429 Error**: If rate limited, respect retry-after header
4. **Network Error**: Retry with backoff
5. **Max Retries**: After 3 attempts, return user-friendly error

### Rate Limiting Flow
1. **Request Check**: Check if user has exceeded rate limit
2. **Window Reset**: Reset counter after time window expires
3. **Block Request**: Return 429 if limit exceeded

### Fallback Flow
1. **Model Error**: If specific model unavailable (404)
2. **Fallback Model**: Try with base model name
3. **Same Retry Logic**: Apply same retry/backoff logic

## Error Messages

### User-Friendly Messages
- **Overloaded**: "Claude API is experiencing high load. Please try again in a few minutes."
- **Rate Limited**: "Too many requests. Please wait a moment before trying again."
- **Network Error**: "Network error occurred while connecting to Claude API."

### Response Format
```json
{
  "error": "User-friendly message",
  "details": "Technical details for debugging",
  "retryAfter": 300
}
```

## Configuration

### Default Settings
```typescript
{
  retry: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
  },
  rateLimit: {
    maxRequests: 10,
    windowMs: 60000
  },
  api: {
    model: "claude-3-5-sonnet-20241022",
    fallbackModel: "claude-3-5-sonnet",
    maxTokens: 1000,
    temperature: 0.7,
    version: "2023-06-01"
  }
}
```

### Environment Variables
- `CLAUDE_MAX_RETRIES`: Maximum retry attempts
- `CLAUDE_RATE_LIMIT_REQUESTS`: Requests per time window
- `CLAUDE_RATE_LIMIT_WINDOW`: Time window in milliseconds

## Benefits

### For Users
- **Reliability**: Automatic handling of temporary API issues
- **Transparency**: Clear error messages with retry guidance
- **Performance**: Reduced failed requests through smart retries

### For System
- **Stability**: Prevents cascading failures
- **Efficiency**: Reduces unnecessary API calls
- **Monitoring**: Detailed logging for debugging

### For API
- **Respect**: Proper rate limiting and backoff
- **Fallback**: Graceful degradation with alternative models
- **Compliance**: Follows API best practices

## Monitoring

### Log Messages
- Retry attempts with attempt number and delay
- Rate limiting events
- Fallback model usage
- Network error details

### Example Logs
```
Claude API overloaded (attempt 1/3), retrying in 1000ms...
Rate limited (attempt 2/3), retrying in 60000ms...
Fallback API overloaded (attempt 1/3), retrying in 2000ms...
```

## Production Considerations

### Rate Limiting
- **Current**: In-memory (resets on server restart)
- **Recommended**: Redis or database-backed rate limiter
- **Scaling**: Consider per-user rate limiting

### Monitoring
- **Metrics**: Track retry rates and success rates
- **Alerts**: Monitor for high retry frequency
- **Logs**: Centralized logging for debugging

### Configuration
- **Environment**: Use environment variables for different environments
- **Dynamic**: Consider runtime configuration updates
- **Validation**: Validate configuration on startup

## Testing

### Test Scenarios
1. **Normal Operation**: Verify successful requests
2. **529 Errors**: Test retry logic with mock overloaded responses
3. **429 Errors**: Test rate limiting with mock rate limit responses
4. **Network Errors**: Test network failure scenarios
5. **Model Fallback**: Test fallback to base model

### Mock Responses
```typescript
// Mock 529 response
{ status: 529, body: '{"type":"error","error":{"type":"overloaded_error","message":"Overloaded"}}' }

// Mock 429 response
{ status: 429, headers: { 'retry-after': '60' } }
```

This implementation provides robust protection against Claude API overload issues while maintaining a good user experience. 