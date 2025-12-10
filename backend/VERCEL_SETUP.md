# Vercel Backend Deployment - MongoDB Setup

## Step 1: Set Environment Variables in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your backend project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

### Required Environment Variables:

**MONGODB_URI**
```
MONGODB_URI=mongodb+srv://sufianali122nb:1234sufi@cluster0.0qnf0nx.mongodb.net/gallamandi?appName=Cluster0
```

**JWT_SECRET** (Create a strong random secret)
```
your_super_secret_jwt_key_change_this_in_production
```

**PORT** (Optional - Vercel sets this automatically)
```
5000
```

### How to Add in Vercel:
1. Click **Add New** button
2. Enter variable name: `MONGODB_URI`
3. Enter value: `MONGODB_URI=mongodb+srv://sufianali122nb:1234sufi@cluster0.0qnf0nx.mongodb.net/gallamandi?appName=Cluster0`
4. Select environments: **Production**, **Preview**, **Development** (select all)
5. Click **Save**
6. Repeat for `JWT_SECRET` and `PORT` if needed

## Step 2: Redeploy Backend

After adding environment variables:

1. Go to **Deployments** tab
2. Click on the **three dots** (⋯) next to latest deployment
3. Click **Redeploy**
4. Or use Vercel CLI:
   ```bash
   cd backend
   vercel --prod
   ```

## Step 3: Verify Connection

After redeployment, check the deployment logs:
- Go to **Deployments** → Click on latest deployment → **Logs**
- You should see: "MongoDB Connected Successfully"

## Local Development Setup

Create a `.env` file in the `backend` folder:

```
MONGODB_URI=MONGODB_URI=mongodb+srv://sufianali122nb:1234sufi@cluster0.0qnf0nx.mongodb.net/gallamandi?appName=Cluster0
JWT_SECRET=your_local_jwt_secret_key
PORT=5000
```

## Important Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **JWT_SECRET**: Use a different, strong secret for production
3. **MongoDB Atlas**: Make sure your IP is whitelisted in MongoDB Atlas Network Access
4. **Database Name**: If you need a specific database name, add it to the URI:
   ```
   mongodb+srv://sufianali122nb:1234sufi@cluster0.0qnf0nx.mongodb.net/your-database-name?appName=Cluster0
   ```

## Testing

Test locally:
```bash
cd backend
npm start
```

You should see: "MongoDB Connected Successfully"

