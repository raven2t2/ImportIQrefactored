# ImportIQ Deployment Guide

## Quick Start for GitHub Deployment

### 1. Push to GitHub Repository

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial ImportIQ deployment"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/importiq.git

# Push to GitHub
git push -u origin main
```

### 2. Environment Variables Setup

Configure these environment variables in your deployment platform:

**Required Variables:**
```
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-secure-session-secret
OPENAI_API_KEY=sk-your-openai-api-key
REPL_ID=your-replit-app-id
REPLIT_DOMAINS=your-domain.com
```

**Optional Variables:**
```
APIFY_API_TOKEN=your-apify-token
STRIPE_SECRET_KEY=sk_your-stripe-secret
VITE_STRIPE_PUBLIC_KEY=pk_your-stripe-public
SENDGRID_API_KEY=SG.your-sendgrid-key
VITE_GA_MEASUREMENT_ID=G-your-ga-id
```

### 3. Database Setup

The application uses PostgreSQL with Drizzle ORM. After setting up your database:

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start the application
npm run dev
```

### 4. Replit Deployment

1. Connect your GitHub repository to Replit
2. Import the project from GitHub
3. Add environment variables in Replit Secrets
4. Use Replit's deployment feature

### 5. Alternative Deployment Platforms

**Vercel:**
- Import from GitHub
- Set environment variables
- Deploy automatically

**Railway:**
- Connect GitHub repository
- Add PostgreSQL service
- Configure environment variables

**Heroku:**
- Add Heroku Postgres addon
- Set environment variables
- Deploy from GitHub

## Features Verified for Deployment

✅ **Image Filtering System**
- Removes Japanese promotional content
- Retains authentic vehicle inspection photos
- Supports multiple sequence ranges (101-160, 201-260)
- Fallback system prevents empty photo arrays

✅ **Market Data Intelligence**
- Real-time auction data processing
- Currency conversion (JPY/USD to AUD)
- Advanced anti-bot countermeasures
- Data caching and validation

✅ **User Interface**
- Responsive design with Tailwind CSS
- Image zoom with navigation controls
- Keyboard shortcuts (arrow keys)
- Thumbnail navigation

✅ **Backend Services**
- Express.js with TypeScript
- Authentication system
- Admin dashboard
- API endpoints

## Production Considerations

1. **Database Performance**
   - Configure connection pooling
   - Set up read replicas if needed
   - Enable query optimization

2. **Security**
   - Enable HTTPS
   - Configure CORS properly
   - Validate all user inputs
   - Use environment variables for secrets

3. **Monitoring**
   - Set up error tracking
   - Monitor API response times
   - Track user analytics

4. **Scaling**
   - Configure load balancing
   - Implement caching strategies
   - Optimize image delivery

## Troubleshooting

**Database Connection Issues:**
- Verify DATABASE_URL format
- Check network connectivity
- Ensure database exists

**Authentication Problems:**
- Verify REPL_ID and REPLIT_DOMAINS
- Check session secret configuration
- Validate redirect URLs

**Image Loading Issues:**
- Verify CDN accessibility
- Check image filtering logic
- Monitor external image sources

## Support

For deployment assistance, verify:
1. All environment variables are correctly set
2. Database schema is properly migrated
3. External services are accessible
4. Application logs for specific error messages