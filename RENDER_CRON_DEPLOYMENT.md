# 🚀 Render Deployment with Cron Jobs

This guide explains how to deploy your YouTube automation app on Render with automatic cron job scheduling.

## 📋 Overview

Your app will be deployed as **two separate services** on Render:

1. **Web Service** - Main application with API endpoints
2. **Worker Service** - Background cron job scheduler

## 🔧 Step 1: Prepare Your Repository

### 1.1 Ensure Your Code is Ready

```bash
# Make sure all files are committed
git add .
git commit -m "Prepare for Render deployment with cron jobs"
git push origin main
```

### 1.2 Verify Configuration Files

- ✅ `render.yaml` - Contains both web and worker services
- ✅ `package.json` - Has all required scripts
- ✅ `.env` - Contains all API keys (don't commit this!)

## 🌐 Step 2: Deploy to Render

### 2.1 Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Connect your GitHub repository

### 2.2 Deploy Using Blueprint

1. Click **"New +"** → **"Blueprint"**
2. Connect your GitHub repository
3. Render will automatically detect the `render.yaml` file
4. Click **"Apply"** to deploy both services

### 2.3 Manual Deployment (Alternative)

If you prefer manual setup:

#### Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `youtube-automation-web`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/health`

#### Worker Service

1. Click **"New +"** → **"Worker Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `youtube-automation-cron`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run cron start`

## 🔑 Step 3: Set Environment Variables

### 3.1 Required Environment Variables

Set these in **both** services (web and worker):

```
# API Keys
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

# Configuration
NODE_ENV=production
TZ=Europe/London
CRON_SCHEDULE_TYPE=sixPerDay
PORT=10000
```

### 3.2 How to Set Environment Variables

1. Go to your service dashboard on Render
2. Click **"Environment"** tab
3. Add each variable with its value
4. Click **"Save Changes"**
5. **Redeploy** the service

## 📊 Step 4: Monitor Your Services

### 4.1 Check Service Status

- **Web Service:** `https://your-app-name.onrender.com/health`
- **Worker Service:** Check logs in Render dashboard

### 4.2 Monitor Cron Jobs

Visit these endpoints on your web service:

- **Health Check:** `/health`
- **Upload Stats:** `/status`
- **Current Schedule:** `/schedule`

### 4.3 View Logs

1. Go to your worker service dashboard
2. Click **"Logs"** tab
3. Monitor for cron job execution

## ⚙️ Step 5: Configuration Options

### 5.1 Change Upload Frequency

Set `CRON_SCHEDULE_TYPE` environment variable:

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
TZ=UTC
```

### 5.3 Manual Trigger

To manually run automation:

```bash
curl -X POST https://your-app-name.onrender.com/trigger
```

## 🔍 Step 6: Troubleshooting

### 6.1 Worker Service Not Running

1. Check worker service logs in Render dashboard
2. Verify all environment variables are set
3. Check if the start command is correct: `npm run cron start`

### 6.2 Cron Jobs Not Executing

1. Check worker service logs for cron job messages
2. Verify timezone setting matches your location
3. Check if the service is active (not suspended)

### 6.3 Build Failures

1. Check if all dependencies are in `package.json`
2. Verify Node.js version compatibility
3. Check for syntax errors in your code

### 6.4 Environment Variables Issues

1. Ensure variables are set in **both** services
2. Check for typos in variable names
3. Verify API keys are valid

## 📈 Step 7: Monitoring & Alerts

### 7.1 Render Logs

- View real-time logs in Render dashboard
- Set up log forwarding if needed
- Monitor for errors and warnings

### 7.2 Health Checks

Set up external monitoring:

- **UptimeRobot:** Monitor web service health
- **Cron-job.org:** Ping web service every 5 minutes
- **GitHub Actions:** Automated health checks

### 7.3 Custom Notifications

You can set up:

- **Discord/Slack notifications** for uploads
- **Email alerts** for failures
- **Custom dashboard** using the API endpoints

## 💰 Step 8: Cost Management

### 8.1 Free Tier Limits

- **Web Service:** 750 hours/month
- **Worker Service:** 750 hours/month
- **Bandwidth:** 100GB/month

### 8.2 Optimization Tips

1. **Use efficient scheduling** - Don't run too frequently
2. **Monitor usage** - Check Render dashboard regularly
3. **Optimize video generation** - Reduce processing time
4. **Clean up logs** - Prevent storage bloat

## 🎯 Success Metrics

Monitor these endpoints:

- **Health:** `/health` - Service status
- **Stats:** `/status` - Upload statistics
- **Schedule:** `/schedule` - Current cron schedule

## 🚨 Important Notes

### 8.1 Service Independence

- **Web service** can be down without affecting cron jobs
- **Worker service** runs independently of web service
- Both services need the same environment variables

### 8.2 Logs and Storage

- Logs are stored in Render's system
- Files generated during automation are temporary
- Consider setting up external log storage for long-term monitoring

### 8.3 Security

- Never commit `.env` files to Git
- Use Render's environment variable system
- Regularly rotate API keys

## 🔄 Step 9: Updates and Maintenance

### 9.1 Deploying Updates

1. Push changes to GitHub
2. Render will automatically redeploy
3. Both services will be updated

### 9.2 Scaling

- **Free tier:** 1 instance per service
- **Paid tier:** Can scale to multiple instances
- **Worker service:** Usually 1 instance is sufficient

### 9.3 Backup Strategy

- Export logs regularly
- Backup environment variables
- Monitor upload statistics

## 📞 Support

If you encounter issues:

1. Check Render's documentation
2. Review service logs
3. Verify environment variables
4. Test locally first

---

**🎉 Congratulations!** Your YouTube automation app is now running on Render with automatic cron job scheduling!
