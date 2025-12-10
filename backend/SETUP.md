# Backend Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- MongoDB installed and running locally or MongoDB Atlas account

## Local Setup

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Create .env file**
Create a `.env` file in the backend folder:
```
MONGODB_URI=mongodb+srv://sufianali122nb:1234sufi@cluster0.0qnf0nx.mongodb.net/gallamandi?appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
```

3. **Start MongoDB**
Make sure MongoDB is running on your local machine:
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
# or
mongod
```

4. **Create Default Admin**
```bash
npm run create-admin
```
This will create a default admin:
- Email: admin@bexon.com
- Password: admin123

**⚠️ IMPORTANT: Change the password after first login!**

5. **Run Development Server**
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## Vercel Deployment

### Step 1: Prepare for Deployment

1. Make sure your code is pushed to GitHub

2. Update `vercel.json` if needed (already configured)

### Step 2: Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
cd backend
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No** (for first time)
- Project name? (Press enter for default)
- Directory? **./** (current directory)
- Override settings? **No**

4. **Set Environment Variables**:
After deployment, go to Vercel Dashboard:
- Go to your project → Settings → Environment Variables
- Add these variables:
  - `MONGODB_URI`: Your MongoDB connection string (can be MongoDB Atlas)
  - `JWT_SECRET`: A strong secret key for JWT tokens

### Step 3: MongoDB Atlas Setup (Recommended for Production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Replace `<password>` with your database password
5. Add your connection string to Vercel environment variables as `MONGODB_URI`

Example MongoDB Atlas URI:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Company?retryWrites=true&w=majority
```

### Step 4: Create Admin After Deployment

After deployment, you can create admin by:
1. Using MongoDB Compass or MongoDB Atlas UI
2. Or create a temporary script endpoint
3. Or use the createAdmin script locally pointing to your production database

## API Endpoints

### Base URL
- Local: `http://localhost:5000/api`
- Production: `https://your-vercel-app.vercel.app/api`

### Authentication
- `POST /api/auth/company/login` - Company login
- `POST /api/auth/admin/login` - Admin login

### Admin Routes (Requires Admin Token)
- `GET /api/admin/companies` - Get all companies
- `GET /api/admin/companies/:id` - Get single company
- `POST /api/admin/companies` - Create new company
- `PUT /api/admin/companies/:id` - Update company
- `DELETE /api/admin/companies/:id` - Delete company

### Company Routes (Requires Company Token)
- `GET /api/company/profile` - Get company profile
- `PUT /api/company/profile` - Update company profile
- `POST /api/company/persons` - Add person
- `PUT /api/company/persons/:personId` - Update person
- `DELETE /api/company/persons/:personId` - Delete person

## Frontend Configuration

Update your frontend `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

For production, update to your Vercel URL:
```
REACT_APP_API_URL=https://your-vercel-app.vercel.app/api
```

## Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB is running
- Check your connection string
- For MongoDB Atlas, whitelist your IP address

### Vercel Deployment Issues
- Check environment variables are set correctly
- Make sure `vercel.json` is in the backend folder
- Check Vercel function logs for errors

### CORS Issues
- CORS is already configured in `server.js`
- If issues persist, check allowed origins

