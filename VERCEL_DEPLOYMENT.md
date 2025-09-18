# Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the Neon Ledger Protect application to Vercel.

## Prerequisites

- Vercel account (free tier available)
- GitHub repository access
- Environment variables ready

## Step-by-Step Deployment

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"

### 2. Import GitHub Repository

1. Select "Import Git Repository"
2. Find and select your repository
3. Click "Import"

### 3. Configure Project Settings

#### Build Settings
- **Framework Preset**: Vite
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Environment Variables
Add the following environment variables in Vercel dashboard:

```
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_INFURA_API_KEY=YOUR_INFURA_KEY
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_FHE_RELAYER_URL=https://...
```

### 4. Deploy Configuration

#### Vercel Configuration File
The project includes a `vercel.json` file with the correct configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Note**: Environment variables should be set in the Vercel dashboard, not in the vercel.json file.

### 5. Deployment Steps

1. **Click "Deploy"** in Vercel dashboard
2. Wait for build process to complete
3. Vercel will provide a deployment URL

### 6. Domain Configuration (Optional)

#### Custom Domain Setup
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed by Vercel
4. Wait for SSL certificate to be issued

### 7. Environment Variables Setup

#### Required Variables
```bash
# Chain Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Wallet Connect
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_PROJECT_ID

# Infura (Optional)
NEXT_PUBLIC_INFURA_API_KEY=YOUR_INFURA_KEY

# Contract Address (Update after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# FHE Relayer (Update with actual relayer URL)
NEXT_PUBLIC_FHE_RELAYER_URL=https://...
```

#### Setting Variables in Vercel
1. Go to Project Settings → Environment Variables
2. Add each variable with its value
3. Set environment (Production, Preview, Development)
4. Click "Save"

### 8. Build Configuration

#### Package.json Scripts
Ensure these scripts exist in `package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 9. Post-Deployment Setup

#### Smart Contract Deployment
1. Deploy smart contract to Sepolia testnet
2. Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in Vercel
3. Redeploy the application

#### FHE Relayer Setup
1. Set up FHE relayer service
2. Update `NEXT_PUBLIC_FHE_RELAYER_URL` in Vercel
3. Test encrypted transactions

### 10. Monitoring and Maintenance

#### Vercel Analytics
1. Enable Vercel Analytics in project settings
2. Monitor performance and errors
3. Set up alerts for build failures

### 11. Troubleshooting

#### Common Issues
1. **Build Failures**: Check build logs in Vercel dashboard
2. **Environment Variables**: Verify all required variables are set
3. **Wallet Connection**: Ensure WalletConnect project ID is correct
4. **RPC Issues**: Verify RPC URL is accessible
5. **Function Runtime Error**: Remove any invalid function configurations from vercel.json
6. **Vite Build Issues**: Ensure all dependencies are properly installed

#### Debug Steps
1. Check Vercel function logs
2. Test locally with `npm run dev`
3. Verify environment variables
4. Check browser console for errors

### 12. Security Considerations

#### Environment Security
- Never commit `.env` files to repository
- Use Vercel's environment variable system
- Rotate API keys regularly
- Monitor for exposed secrets

## Deployment Checklist

- [ ] Repository connected to Vercel
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Domain configured (if custom)
- [ ] SSL certificate active
- [ ] Smart contract deployed
- [ ] FHE relayer configured
- [ ] Analytics enabled
- [ ] Performance optimized
- [ ] Security measures in place

## Support

For deployment issues:
1. Check Vercel documentation
2. Review build logs
3. Test locally first
4. Contact Vercel support if needed