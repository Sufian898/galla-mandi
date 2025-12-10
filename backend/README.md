# Bexon Backend API

Backend API for Bexon Company Management System with MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
MONGODB_URI=mongodb+srv://sufianali122nb:1234sufi@cluster0.0qnf0nx.mongodb.net/gallamandi?appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```

3. Run development server:
```bash
npm run dev
```

4. Run production server:
```bash
npm start
```

## API Endpoints

### Auth Routes
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

## Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
- MONGODB_URI
- JWT_SECRET

