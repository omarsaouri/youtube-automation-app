#!/bin/bash

echo "🚀 YouTube Automation - Render Free Tier Deployment"
echo "=================================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No remote origin found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    exit 1
fi

echo "✅ Git repository configured"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Deploy to Render free tier - $(date)"
git push origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Go to https://render.com and sign in"
echo "2. Click 'New +' and select 'Web Service'"
echo "3. Connect your GitHub repository"
echo "4. Configure the service:"
echo "   - Name: youtube-automation-app"
echo "   - Environment: Node"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "   - Port: 10000"
echo ""
echo "5. Set Environment Variables:"
echo "   - NODE_ENV: production"
echo "   - TZ: Europe/London"
echo "   - PORT: 10000"
echo "   - CRON_SCHEDULE_TYPE: sixPerDay"
echo ""
echo "6. Deploy the service"
echo ""
echo "7. Set up external ping services (see RENDER_FREE_TIER_SETUP.md):"
echo "   - UptimeRobot: https://uptimerobot.com"
echo "   - Cron-job.org: https://cron-job.org"
echo "   - Pingdom: https://pingdom.com"
echo ""
echo "8. Monitor your service at:"
echo "   - Dashboard: https://your-app-name.onrender.com/"
echo "   - Health: https://your-app-name.onrender.com/health"
echo ""
echo "📖 For detailed instructions, see: RENDER_FREE_TIER_SETUP.md"
echo ""
echo "🎉 Your YouTube automation will be ready for free tier deployment!" 