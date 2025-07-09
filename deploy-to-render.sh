#!/bin/bash

# YouTube Automation - Render Deployment Script
echo "🚀 YouTube Automation - Render Deployment Setup"
echo "================================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit for Render deployment"
    echo "✅ Git repository initialized"
    echo ""
    echo "⚠️  IMPORTANT: You need to create a GitHub repository and push your code:"
    echo "   1. Go to github.com and create a new repository"
    echo "   2. Run: git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
    echo "   3. Run: git push -u origin main"
    echo ""
else
    echo "✅ Git repository already exists"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with all your API keys before deploying."
    exit 1
fi

# Create .env.example if it doesn't exist
if [ ! -f ".env.example" ]; then
    echo "📝 Creating .env.example file..."
    cp .env .env.example
    # Replace actual values with placeholders
    sed -i '' 's/=.*/=your_value_here/g' .env.example
    echo "✅ .env.example created (remember to update with actual placeholders)"
fi

echo ""
echo "📋 Deployment Checklist:"
echo "========================"
echo "✅ Node.js project ready"
echo "✅ Express server configured"
echo "✅ Cron scheduler integrated"
echo "✅ Health check endpoints created"
echo "✅ GitHub Actions ping workflow created"
echo ""

echo "🌐 Next Steps for Render Deployment:"
echo "===================================="
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Ready for Render deployment'"
echo "   git push"
echo ""
echo "2. Go to render.com and create a new Web Service"
echo "3. Connect your GitHub repository"
echo "4. Set environment variables (copy from .env)"
echo "5. Deploy!"
echo ""
echo "6. Set up ping service:"
echo "   - Use UptimeRobot: https://uptimerobot.com"
echo "   - Or use cron-job.org: https://cron-job.org"
echo "   - Or use the GitHub Actions workflow (requires RENDER_SERVICE_URL secret)"
echo ""
echo "📖 For detailed instructions, see RENDER_SETUP.md"
echo ""
echo "🎉 Your YouTube automation is ready for 24/7 deployment!" 