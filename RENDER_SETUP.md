# 🚀 Render.com Deployment Guide

This guide will help you deploy your YouTube automation app to Render.com for free 24/7 operation with background ping to keep it active.

## 📋 Prerequisites

1. **GitHub Account** - Your code needs to be on GitHub
2. **Render.com Account** - Sign up at [render.com](https://render.com)
3. **All API Keys** - Make sure your `.env` file is ready

## 🔧 Step 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit for Render deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 1.2 Create Environment Variables File
Create a file called `.env.example` (without your actual API keys):
```bash
# Copy your .env file but remove actual values
cp .env .env.example
# Edit .env.example and replace all values with placeholders
```

## 🌐 Step 2: Deploy to Render

### 2.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Connect your GitHub repository

### 2.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:

**Basic Settings:**
- **Name:** `youtube-automation`
- **Environment:** `Node`
- **Region:** Choose closest to you
- **Branch:** `main`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Environment Variables:**
Add all your API keys from `.env`:
```
OPENAI_API_KEY=your_openai_key
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REFRESH_TOKEN=your_youtube_refresh_token
STABILITY_API_KEY=your_stability_key
AZURE_SPEECH_KEY=your_azure_key
AZURE_SPEECH_REGION=your_azure_region
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_aws_region
TZ=UTC
CRON_SCHEDULE_TYPE=sixPerDay
```

### 2.3 Deploy
1. Click **"Create Web Service"**
2. Wait for the build to complete (5-10 minutes)
3. Your service will be available at: `https://your-app-name.onrender.com`

## 🔄 Step 3: Set Up Background Ping

### 3.1 Using UptimeRobot (Free)
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up for a free account
3. Add a new monitor:
   - **Monitor Type:** HTTP(s)
   - **URL:** `https://your-app-name.onrender.com/health`
   - **Check Interval:** 5 minutes
   - **Name:** `YouTube Automation Health Check`

### 3.2 Using Cron-job.org (Free)
1. Go to [cron-job.org](https://cron-job.org)
2. Sign up for a free account
3. Create a new cronjob:
   - **URL:** `https://your-app-name.onrender.com/health`
   - **Schedule:** Every 5 minutes
   - **Name:** `YouTube Automation Ping`

### 3.3 Using GitHub Actions (Free)
Create `.github/workflows/ping.yml`:
```yaml
name: Ping Render Service
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping service
        run: |
          curl -f https://your-app-name.onrender.com/health || echo "Service might be sleeping"
```

## 📊 Step 4: Monitor Your Service

### 4.1 Health Check
Visit: `https://your-app-name.onrender.com/health`
Should return:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "stats": {
    "total": 5,
    "successful": 4,
    "failed": 1,
    "successRate": "80.00"
  }
}
```

### 4.2 Status Dashboard
Visit: `https://your-app-name.onrender.com/status`
Shows upload statistics and recent activity.

### 4.3 Manual Trigger
To manually run automation:
```bash
curl -X POST https://your-app-name.onrender.com/trigger
```

## ⚙️ Step 5: Configuration Options

### 5.1 Change Schedule Frequency
Set environment variable in Render dashboard:
```
CRON_SCHEDULE_TYPE=threePerDay    # 3 videos per day
CRON_SCHEDULE_TYPE=fourPerDay     # 4 videos per day
CRON_SCHEDULE_TYPE=sixPerDay      # 6 videos per day (default)
CRON_SCHEDULE_TYPE=eightPerDay    # 8 videos per day
```

### 5.2 Set Timezone
```
TZ=America/New_York
TZ=Europe/London
TZ=Asia/Dubai
```

## 🔍 Step 6: Troubleshooting

### 6.1 Service Not Responding
1. Check Render logs in the dashboard
2. Verify all environment variables are set
3. Check if the ping service is working

### 6.2 Build Failures
1. Check if all dependencies are in `package.json`
2. Verify Node.js version compatibility
3. Check for syntax errors in your code

### 6.3 Automation Not Running
1. Check the `/health` endpoint
2. Verify cron schedule in `/schedule` endpoint
3. Check logs for error messages

## 📈 Step 7: Monitoring & Alerts

### 7.1 Render Logs
- View real-time logs in Render dashboard
- Set up log forwarding if needed

### 7.2 Custom Monitoring
You can set up additional monitoring:
- **Discord/Slack notifications** for uploads
- **Email alerts** for failures
- **Custom dashboard** using the API endpoints

## 🎯 Success Metrics

Monitor these endpoints:
- **Health:** `/health` - Service status
- **Stats:** `/status` - Upload statistics
- **Schedule:** `/schedule` - Current cron schedule

## 💡 Tips for Free Tier

1. **Keep pings frequent** (every 5 minutes) to prevent sleep
2. **Monitor usage** - Free tier has limits
3. **Use efficient scheduling** - Don't run too frequently
4. **Backup your data** - Export logs regularly

## 🚨 Important Notes

- **Free tier limitations:** Service may sleep after 15 minutes of inactivity
- **Build time:** First deployment takes 5-10 minutes
- **Cold starts:** Service may take 30-60 seconds to wake up
- **Logs:** Check Render dashboard for detailed logs

## 🎉 You're Done!

Your YouTube automation is now running 24/7 on Render.com! The service will:
- ✅ Generate and upload videos automatically
- ✅ Stay active with background pings
- ✅ Provide monitoring endpoints
- ✅ Handle errors gracefully
- ✅ Run completely free

Visit your service URL to monitor and manage your automation! 