# 🚀 Vercel Deployment Guide for Cipher DAO Spend

This guide provides step-by-step instructions for deploying the Cipher DAO Spend application to Vercel.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier available)
- Node.js 18+ installed locally
- Git installed

## 🔧 Step 1: Create GitHub Repository

1. **Login to GitHub** using the Eva-Rodriguez-Bug account
2. **Create a new repository**:
   - Repository name: `cipher-dao-spend`
   - Description: `Privacy-First DAO Governance Platform with FHE Encryption`
   - Set to Public
   - Don't initialize with README (we already have one)
3. **Push the code**:
   ```bash
   cd /path/to/cipher-dao-spend
   git remote add origin https://github.com/Eva-Rodriguez-Bug/cipher-dao-spend.git
   git push -u origin main
   ```

## 🌐 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Visit Vercel**: Go to [vercel.com](https://vercel.com)
2. **Sign up/Login**: Use your GitHub account to authenticate
3. **Import Project**:
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose `Eva-Rodriguez-Bug/cipher-dao-spend`
   - Click "Import"

4. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Environment Variables**:
   Add the following environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_CHAIN_ID=11155111
   NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=2ec9743d0d0cd7fb94dee1a7e6d33475
   NEXT_PUBLIC_INFURA_API_KEY=b18fb7e6ca7045ac83c41157ab93f990
   ```

6. **Deploy**: Click "Deploy" button

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd cipher-dao-spend
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project: No
   - Project name: cipher-dao-spend
   - Directory: ./
   - Override settings: No

## ⚙️ Step 3: Environment Configuration

### Required Environment Variables

Set these in your Vercel project settings:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_CHAIN_ID` | `11155111` | Ethereum Sepolia Chain ID |
| `NEXT_PUBLIC_RPC_URL` | `https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990` | Sepolia RPC URL |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | `2ec9743d0d0cd7fb94dee1a7e6d33475` | WalletConnect Project ID |
| `NEXT_PUBLIC_INFURA_API_KEY` | `b18fb7e6ca7045ac83c41157ab93f990` | Infura API Key |

### How to Add Environment Variables in Vercel:

1. Go to your project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the sidebar
4. Add each variable with the values above
5. Make sure to add them for all environments (Production, Preview, Development)
6. Click "Save"

## 🔄 Step 4: Automatic Deployments

Once configured, Vercel will automatically:
- Deploy on every push to the `main` branch
- Create preview deployments for pull requests
- Provide instant rollbacks if needed

## 🌍 Step 5: Custom Domain (Optional)

1. **Add Domain**:
   - Go to project settings
   - Click "Domains" tab
   - Add your custom domain

2. **Configure DNS**:
   - Add CNAME record pointing to your Vercel deployment
   - Wait for DNS propagation (up to 24 hours)

## 📊 Step 6: Monitoring & Analytics

Vercel provides built-in:
- **Performance Analytics**: Core Web Vitals monitoring
- **Function Logs**: Serverless function execution logs
- **Deployment History**: Track all deployments
- **Error Tracking**: Automatic error detection

## 🛠️ Step 7: Build Optimization

### Vercel Build Settings:
- **Node.js Version**: 18.x (automatic)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Performance Optimizations:
- Automatic image optimization
- Edge functions for API routes
- CDN distribution worldwide
- Automatic HTTPS

## 🔧 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check build logs in Vercel dashboard

2. **Environment Variables**:
   - Ensure all required variables are set
   - Check variable names match exactly
   - Redeploy after adding new variables

3. **Wallet Connection Issues**:
   - Verify WalletConnect Project ID is correct
   - Check RPC URL is accessible
   - Ensure chain ID matches Sepolia (11155111)

### Build Logs:
Access build logs in Vercel dashboard:
1. Go to project dashboard
2. Click on deployment
3. View "Build Logs" tab

## 📱 Step 8: Testing Deployment

After deployment:

1. **Visit your Vercel URL**
2. **Test wallet connection**:
   - Connect MetaMask or other wallet
   - Switch to Sepolia testnet
   - Verify connection works

3. **Test DAO functionality**:
   - View proposals
   - Test voting (if implemented)
   - Check treasury display

## 🔐 Security Considerations

- Environment variables are encrypted in Vercel
- HTTPS is automatically enabled
- No sensitive data in client-side code
- FHE encryption handles privacy

## 📈 Performance Monitoring

Monitor your deployment:
- **Vercel Analytics**: Built-in performance metrics
- **Core Web Vitals**: Automatic monitoring
- **Error Tracking**: Real-time error detection
- **Uptime Monitoring**: 99.99% uptime SLA

## 🎉 Success!

Your Cipher DAO Spend application is now live on Vercel with:
- ✅ Automatic deployments
- ✅ Global CDN
- ✅ HTTPS security
- ✅ Performance optimization
- ✅ Environment variable management

## 📞 Support

If you encounter issues:
1. Check Vercel documentation
2. Review build logs
3. Verify environment variables
4. Test locally first

---

**🚀 Happy Deploying! Your DAO governance platform is ready for the world! 🚀**