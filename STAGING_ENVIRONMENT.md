# SPARK AI - Staging Environment Guide

## 🌐 Staging Environment URLs

### Current Deployments
- **Production**: https://spark.audiencelab.io
- **Staging (Preview)**: https://spark-6vz9jozl1-deeeps-projects-8d9261fd.vercel.app
- **Latest Production**: https://spark-huqvst5l3-deeeps-projects-8d9261fd.vercel.app

## 📋 Environment Setup

### Vercel Project Configuration
- **Project Name**: `spark-ai`
- **Team**: `deeeps-projects-8d9261fd`
- **GitHub Repository**: https://github.com/alucerne/sparkv3
- **Framework**: Next.js 14.2.5

### Environment Variables

#### Production Environment
- `OPENAI_API_KEY` - OpenAI API key for production
- `NEXT_PUBLIC_SPARK_API_URL` - Production backend URL

#### Preview/Staging Environment
- `OPENAI_API_KEY` - OpenAI API key for staging
- `NEXT_PUBLIC_SPARK_API_URL` - Staging backend URL

## 🚀 Deployment Workflow

### Staging Deployment Process

1. **Create/Update Staging Branch**
   ```bash
   git checkout -b staging
   # Make your changes
   git add .
   git commit -m "Your changes for staging"
   git push -u origin staging
   ```

2. **Deploy to Staging**
   ```bash
   cd ai-agent-app
   vercel
   ```

3. **Deploy to Production**
   ```bash
   cd ai-agent-app
   vercel --prod
   ```

### Automatic Deployments

- **Main Branch**: Automatically deploys to Production
- **Staging Branch**: Automatically deploys to Preview/Staging
- **Other Branches**: Create Preview deployments for testing

## 🔧 Environment Management

### Adding Environment Variables

```bash
# Add to Preview environment
vercel env add VARIABLE_NAME preview

# Add to Production environment
vercel env add VARIABLE_NAME production

# Add to Development environment
vercel env add VARIABLE_NAME development
```

### Viewing Environment Variables

```bash
# List all environment variables
vercel env ls

# View specific variable
vercel env pull
```

### Removing Environment Variables

```bash
# Remove from specific environment
vercel env rm VARIABLE_NAME
```

## 📊 Deployment Status

### Check Deployment Status
```bash
# List all deployments
vercel ls

# View specific deployment
vercel inspect [deployment-url]
```

### Deployment Environments
- **Production**: Live environment at spark.audiencelab.io
- **Preview**: Staging environment for testing
- **Development**: Local development environment

## 🧪 Testing Staging Environment

### Frontend Testing
1. Visit the staging URL: https://spark-6vz9jozl1-deeeps-projects-8d9261fd.vercel.app
2. Test all features and functionality
3. Verify API integrations work correctly
4. Check for any visual or functional issues

### Backend Testing
1. Ensure SPARK AI backend is accessible
2. Test API endpoints from staging frontend
3. Verify environment variables are correctly set
4. Check for any performance issues

## 🔄 Promotion Process

### Staging to Production Promotion

1. **Test in Staging**
   - Verify all features work correctly
   - Run through test scenarios
   - Check for any issues

2. **Merge to Main**
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

3. **Deploy to Production**
   ```bash
   cd ai-agent-app
   vercel --prod
   ```

4. **Verify Production**
   - Check production URL: https://spark.audiencelab.io
   - Verify all features work correctly
   - Monitor for any issues

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   - Check for TypeScript errors
   - Verify all dependencies are installed
   - Check for missing environment variables

2. **Environment Variable Issues**
   - Verify variables are set for correct environment
   - Check variable names and values
   - Ensure variables are accessible in the application

3. **Deployment Issues**
   - Check Vercel logs for errors
   - Verify GitHub integration is working
   - Check for any configuration issues

### Useful Commands

```bash
# Check Vercel project status
vercel project ls

# View deployment logs
vercel logs [deployment-url]

# Link to existing project
vercel link

# Pull environment variables
vercel env pull

# Deploy with specific configuration
vercel --config vercel-staging.json
```

## 📈 Monitoring and Analytics

### Vercel Analytics
- Monitor deployment performance
- Track user interactions
- Analyze build times and success rates

### Environment Health Checks
- Regular testing of staging environment
- Monitoring of API response times
- Verification of environment variable functionality

## 🔐 Security Considerations

### Environment Variable Security
- Never commit API keys to Git
- Use Vercel's encrypted environment variables
- Regularly rotate API keys
- Monitor API usage and costs

### Access Control
- Limit access to production deployments
- Use team-based permissions in Vercel
- Implement proper code review processes

## 📝 Best Practices

1. **Always test in staging first**
2. **Use descriptive commit messages**
3. **Monitor deployment logs**
4. **Keep environment variables secure**
5. **Regularly update dependencies**
6. **Document any configuration changes**

## 🆘 Support

For issues with the staging environment:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test locally first
4. Check GitHub repository for recent changes
5. Contact the development team

---

**Last Updated**: July 31, 2025
**Environment**: Staging
**Status**: Active 