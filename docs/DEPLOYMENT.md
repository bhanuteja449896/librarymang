# Deployment Guide

## Prerequisites

- Node.js v16+
- MongoDB Atlas account (for production database)
- Heroku/Render account (for backend) - Optional
- Netlify/Vercel account (for frontend) - Optional

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=7d
FINE_PER_DAY=5
MAX_BORROW_DAYS=14
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-domain.com/api
```

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist IP addresses (0.0.0.0/0 for all IPs)
5. Get connection string
6. Update `MONGODB_URI` in backend `.env`

## Backend Deployment (Heroku)

### 1. Install Heroku CLI
```bash
npm install -g heroku
```

### 2. Login to Heroku
```bash
heroku login
```

### 3. Create Heroku App
```bash
cd server
heroku create your-app-name
```

### 4. Set Environment Variables
```bash
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set NODE_ENV=production
```

### 5. Deploy
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

## Frontend Deployment (Netlify)

### 1. Build the Frontend
```bash
npm run build
```

### 2. Install Netlify CLI
```bash
npm install -g netlify-cli
```

### 3. Deploy
```bash
netlify deploy --prod
```

Or use Netlify's web interface:
1. Drag and drop the `dist` folder
2. Set environment variable: `VITE_API_URL`

## Alternative: Vercel Deployment

### Frontend on Vercel

1. Install Vercel CLI
```bash
npm install -g vercel
```

2. Deploy
```bash
vercel --prod
```

3. Set environment variables in Vercel dashboard

## Docker Deployment (Optional)

### Create Dockerfile for Backend

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### Create docker-compose.yml

```yaml
version: '3.8'
services:
  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/library
      - JWT_SECRET=your_secret
    depends_on:
      - mongo
  
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

### Run with Docker
```bash
docker-compose up -d
```

## Post-Deployment Checklist

- [ ] Database connection works
- [ ] Environment variables are set correctly
- [ ] CORS is configured for your frontend domain
- [ ] API endpoints are accessible
- [ ] Authentication works
- [ ] File uploads work (if applicable)
- [ ] Test all major features
- [ ] Monitor logs for errors

## Monitoring

### Heroku Logs
```bash
heroku logs --tail
```

### Check Application Health
```bash
curl https://your-backend-domain.com/api/health
```

## Rollback (if needed)

### Heroku
```bash
heroku rollback
```

### Vercel/Netlify
Use the dashboard to rollback to a previous deployment.

## Performance Optimization

1. Enable compression in Express
2. Use CDN for static assets
3. Implement caching strategies
4. Optimize database queries
5. Use environment-specific configs

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Secure JWT_SECRET
- [ ] Enable rate limiting
- [ ] Validate all inputs
- [ ] Use helmet.js for security headers
- [ ] Keep dependencies updated
- [ ] Use environment variables for sensitive data

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check IP whitelist in MongoDB Atlas
   - Verify connection string
   - Check network connectivity

2. **CORS Errors**
   - Update CORS configuration in backend
   - Add frontend domain to allowed origins

3. **Build Failures**
   - Check Node.js version compatibility
   - Clear cache: `npm cache clean --force`
   - Remove node_modules and reinstall

4. **Environment Variables Not Working**
   - Restart the application
   - Check variable names (VITE_ prefix for Vite)
   - Verify platform-specific setup

## Support

For deployment issues, refer to:
- [Heroku Documentation](https://devcenter.heroku.com/)
- [Netlify Documentation](https://docs.netlify.com/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vercel Documentation](https://vercel.com/docs)
