# Frontend Deployment Guide for Vercel

This guide will help you deploy the frontend to Vercel and connect it to your deployed backend.

## Prerequisites

1. A GitHub account
2. A Vercel account (sign up at https://vercel.com)
3. Your backend already deployed at: `https://scope-backend.vercel.app/`

## Step 1: Push Frontend Code to GitHub

1. Navigate to your frontend directory:
   ```bash
   cd client
   ```

2. Initialize git repository (if not already done):
   ```bash
   git init
   ```

3. Add all files:
   ```bash
   git add .
   ```

4. Commit the changes:
   ```bash
   git commit -m "Initial commit: Frontend ready for Vercel deployment"
   ```

5. Add your GitHub repository as remote (replace with your actual repo URL):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_FRONTEND_REPO.git
   ```

6. Push to GitHub:
   ```bash
   git push -u origin main
   ```
   (Use `master` instead of `main` if your default branch is `master`)

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"** or **"Import Project"**
3. Select **"Import Git Repository"**
4. Choose your frontend GitHub repository
5. Configure the project:
   - **Framework Preset**: Vite (should be auto-detected)
   - **Root Directory**: `client` (if your repo contains both frontend and backend, otherwise leave blank)
   - **Build Command**: `npm run build` (should be auto-filled)
   - **Output Directory**: `dist` (should be auto-filled)
   - **Install Command**: `npm install` (should be auto-filled)

6. **Environment Variables**:
   - Click on **"Environment Variables"**
   - Add the following:
     - **Name**: `VITE_API_BASE_URL`
     - **Value**: `https://scope-backend.vercel.app`
     - **Environment**: Production, Preview, Development (select all)

7. Click **"Deploy"**

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Navigate to your frontend directory:
   ```bash
   cd client
   ```

3. Login to Vercel:
   ```bash
   vercel login
   ```

4. Deploy:
   ```bash
   vercel
   ```

5. When prompted:
   - Set up and deploy? **Yes**
   - Which scope? Select your account
   - Link to existing project? **No**
   - Project name? (Press enter for default or enter custom name)
   - Directory? `./` (or `client` if running from root)
   - Override settings? **No**

6. Set environment variable:
   ```bash
   vercel env add VITE_API_BASE_URL
   ```
   - When prompted, enter: `https://scope-backend.vercel.app`
   - Select all environments (Production, Preview, Development)

7. Redeploy to apply environment variables:
   ```bash
   vercel --prod
   ```

## Step 3: Verify Deployment

1. After deployment, Vercel will provide you with a URL (e.g., `https://your-project.vercel.app`)
2. Open the URL in your browser
3. Test the application:
   - Try logging in
   - Verify API calls are working
   - Check browser console for any errors

## Step 4: Configure Custom Domain (Optional)

1. Go to your project settings in Vercel Dashboard
2. Navigate to **"Domains"**
3. Add your custom domain
4. Follow the DNS configuration instructions

## Environment Variables

The frontend uses the following environment variable:

- `VITE_API_BASE_URL`: The base URL of your backend API
  - Production: `https://scope-backend.vercel.app`
  - Local Development: `http://localhost:3000` (set in `.env.local`)

## Troubleshooting

### Issue: API calls failing with CORS errors

**Solution**: Make sure your backend has CORS configured to allow requests from your Vercel frontend URL.

### Issue: Environment variables not working

**Solution**: 
1. Make sure the variable name starts with `VITE_` (required for Vite)
2. Redeploy after adding environment variables
3. Check that variables are set for the correct environment (Production/Preview/Development)

### Issue: Build fails

**Solution**:
1. Check build logs in Vercel Dashboard
2. Ensure all dependencies are in `package.json`
3. Try building locally: `npm run build`
4. Check for any TypeScript or linting errors

### Issue: Routes not working (404 errors)

**Solution**: The `vercel.json` file is already configured with rewrite rules to handle client-side routing. If issues persist, check the rewrite configuration.

## Local Development

For local development, create a `.env.local` file in the `client` directory:

```env
VITE_API_BASE_URL=http://localhost:3000
```

This file is already in `.gitignore` and won't be committed to the repository.

## Updating the Deployment

Whenever you push changes to your GitHub repository, Vercel will automatically:
1. Detect the changes
2. Build the new version
3. Deploy it (if the build succeeds)

You can also manually trigger deployments from the Vercel Dashboard.

## Support

If you encounter any issues:
1. Check the Vercel deployment logs
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Ensure backend is accessible and CORS is configured

