# Deployment Instructions

This project includes GitHub Actions workflows for automatic deployment of the static site.

## Available Workflows

### 1. GitHub Pages (Recommended)
File: `.github/workflows/github-pages.yml`

**Setup:**
1. Go to your repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Push to main/master branch to trigger deployment

**Features:**
- ✅ Automatic deployment on push
- ✅ Manual deployment via workflow_dispatch
- ✅ Proper permissions and security
- ✅ Concurrent deployment protection

### 2. Multi-Platform Deployment
File: `.github/workflows/deploy.yml`

**Includes deployment to:**
- GitHub Pages
- Netlify (requires secrets)
- Vercel (requires secrets)

## Required Secrets (for Netlify/Vercel)

### Netlify
- `NETLIFY_AUTH_TOKEN` - Your Netlify auth token
- `NETLIFY_SITE_ID` - Your Netlify site ID

### Vercel
- `VERCEL_TOKEN` - Your Vercel token
- `ORG_ID` - Your Vercel organization ID
- `PROJECT_ID` - Your Vercel project ID

## Local Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Serve locally
npm run serve

# Preview production build
npm run preview
```

**Note:** The project includes `package-lock.json` for consistent dependency installation.

## Build Output

The build process creates:
- `build/fr/index.html` - French version
- `build/en/index.html` - English version
- `build/index.html` - Redirect to French
- All static assets (CSS, JS, images)

## Custom Domain Setup

### GitHub Pages
1. Add CNAME file to `build/` directory
2. Configure custom domain in repository settings
3. Update DNS records

### Netlify
1. Configure custom domain in Netlify dashboard
2. Update DNS records

### Vercel
1. Configure custom domain in Vercel dashboard
2. Update DNS records

## Environment Variables

For production builds, you may need to set:
- `NODE_ENV=production`
- Any API keys or configuration values

## Troubleshooting

### Build Fails
- Check Node.js version (requires 16+)
- Verify all dependencies are installed
- Check for syntax errors in source files

### Deployment Fails
- Verify repository permissions
- Check secrets are properly configured
- Review GitHub Actions logs for specific errors

### Site Not Loading
- Verify custom domain DNS settings
- Check if build artifacts are uploaded
- Review deployment logs 