# MongoDB Setup Guide

## Local Development

MongoDB URI has been set in `.env` file:
```
MONGODB_URI=MONGODB_URI=mongodb+srv://sufianali122nb:1234sufi@cluster0.0qnf0nx.mongodb.net/gallamandi?appName=Cluster0
```

## Vercel Deployment

### Step 1: Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variables:

```
MONGODB_URI=MONGODB_URI=mongodb+srv://sufianali122nb:1234sufi@cluster0.0qnf0nx.mongodb.net/gallamandi?appName=Cluster0
JWT_SECRET = your_super_secret_jwt_key_here
PORT = 5000 (optional, Vercel sets this automatically)
```

### Step 2: Redeploy

After adding environment variables, redeploy your backend:
- Go to **Deployments** tab
- Click on the latest deployment
- Click **Redeploy**

Or use Vercel CLI:
```bash
vercel --prod
```

## Important Notes

1. **Security**: Never commit `.env` file to Git (already in .gitignore)
2. **JWT_SECRET**: Make sure to set a strong, random JWT_SECRET in Vercel
3. **MongoDB Atlas**: Your MongoDB URI is already configured for MongoDB Atlas
4. **Database Name**: The connection string will connect to the default database. If you need a specific database name, add it to the URI:
   ```
   mongodb+srv://sufianali122nb:1234sufi@cluster0.0qnf0nx.mongodb.net/your-database-name?appName=Cluster0
   ```

## Testing Connection

To test if MongoDB connection works:
```bash
cd backend
npm start
```

You should see: "MongoDB Connected Successfully"

