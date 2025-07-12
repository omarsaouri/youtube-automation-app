#!/bin/bash

# Render Deployment Script for YouTube Automation App
echo "🚀 YouTube Automation App - Render Deployment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found! Please create it with your API keys."
    exit 1
fi

print_status "Checking Git status..."

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Committing them..."
    git add .
    git commit -m "Auto-commit before Render deployment"
fi

print_status "Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    print_success "Code pushed to GitHub successfully!"
else
    print_error "Failed to push to GitHub. Please check your git configuration."
    exit 1
fi

print_status "Checking render.yaml configuration..."
if [ ! -f "render.yaml" ]; then
    print_error "render.yaml not found! Please ensure it exists."
    exit 1
fi

print_success "Configuration files are ready!"

echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Go to https://render.com"
echo "2. Sign in with your GitHub account"
echo "3. Click 'New +' → 'Blueprint'"
echo "4. Connect your GitHub repository"
echo "5. Render will detect render.yaml and deploy both services"
echo ""
echo "🔑 Environment Variables:"
echo "========================"
echo "Make sure to set these environment variables in BOTH services:"
echo ""
echo "Required API Keys:"
echo "- OPENAI_API_KEY"
echo "- YOUTUBE_CLIENT_ID"
echo "- YOUTUBE_CLIENT_SECRET"
echo "- YOUTUBE_REFRESH_TOKEN"
echo "- STABILITY_API_KEY"
echo "- AZURE_SPEECH_KEY"
echo "- AZURE_SPEECH_REGION"
echo "- AWS_ACCESS_KEY_ID"
echo "- AWS_SECRET_ACCESS_KEY"
echo "- AWS_REGION"
echo ""
echo "Configuration:"
echo "- NODE_ENV=production"
echo "- TZ=Europe/London"
echo "- CRON_SCHEDULE_TYPE=sixPerDay"
echo "- PORT=10000"
echo ""
echo "📊 Monitoring:"
echo "=============="
echo "After deployment, monitor your services at:"
echo "- Web Service: https://your-app-name.onrender.com/health"
echo "- Worker Service: Check logs in Render dashboard"
echo ""
echo "📖 For detailed instructions, see: RENDER_CRON_DEPLOYMENT.md"
echo ""
print_success "Deployment preparation completed!" 