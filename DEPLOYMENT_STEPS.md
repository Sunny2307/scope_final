# Quick Deployment Steps for Frontend to Vercel

## ✅ What Has Been Done

1. ✅ Created centralized API configuration (`src/config/api.js`)
2. ✅ Created axios instance with environment variable support (`src/utils/axiosInstance.js`)
3. ✅ Updated all API calls throughout the codebase to use the centralized configuration
4. ✅ Created `vercel.json` for Vercel deployment configuration
5. ✅ Updated `.gitignore` to exclude environment files
6. ✅ Created deployment documentation

## 🚀 Deployment Steps

### Step 1: Push Code to GitHub

```bash
cd client
git init  # if not already initialized
git add .
git commit -m "Setup frontend for Vercel deployment"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_FRONTEND_REPO.git
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"** → **"Import Git Repository"**
3. Select your frontend GitHub repository
4. Configure:
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: Leave blank (or `client` if repo contains both frontend/backend)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `dist` (auto-filled)
5. **Add Environment Variable**:
   - Click **"Environment Variables"**
   - Add: `VITE_API_BASE_URL` = `https://scope-backend.vercel.app`
   - Select all environments (Production, Preview, Development)
6. Click **"Deploy"**

#### Option B: Via Vercel CLI

```bash
cd client
npm install -g vercel
vercel login
vercel
# Follow prompts, then:
vercel env add VITE_API_BASE_URL
# Enter: https://scope-backend.vercel.app
# Select all environments
vercel --prod
```

### Step 3: Verify

1. Vercel will provide a URL (e.g., `https://your-project.vercel.app`)
2. Open the URL and test the application
3. Check browser console for any errors

## 📝 Important Notes

- **Environment Variable**: The frontend uses `VITE_API_BASE_URL` to connect to your backend
- **Local Development**: Create `.env.local` in `client/` folder:
  ```
  VITE_API_BASE_URL=http://localhost:3000
  ```
- **Automatic Deployments**: Pushing to GitHub will automatically trigger new deployments

## 🔧 Troubleshooting

- **CORS Errors**: Ensure backend allows requests from your Vercel frontend URL
- **Environment Variables Not Working**: 
  - Must start with `VITE_` prefix
  - Redeploy after adding variables
- **404 on Routes**: `vercel.json` is already configured for client-side routing

## 📚 Full Documentation

See `README_DEPLOYMENT.md` for detailed deployment guide and troubleshooting.

