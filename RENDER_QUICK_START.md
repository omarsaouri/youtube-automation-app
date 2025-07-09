# 🚀 Quick Start: Deploy to Render.com

Your YouTube automation is now ready for **free 24/7 deployment** on Render.com!

## ✅ What's Ready

- ✅ **Express server** with health checks
- ✅ **Cron scheduler** integrated
- ✅ **Background ping** to keep service active
- ✅ **Monitoring endpoints** for status tracking
- ✅ **GitHub Actions** ping workflow
- ✅ **Deployment scripts** and configuration

## 🚀 Deploy in 5 Minutes

### Step 1: Push to GitHub
```bash
# Run the deployment script
./deploy-to-render.sh

# Or manually:
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `youtube-automation`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add all environment variables from your `.env` file
6. Click **"Create Web Service"**

### Step 3: Set Up Ping Service
Choose one of these **free options**:

**Option A: UptimeRobot (Recommended)**
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Add monitor: `https://your-app-name.onrender.com/health`
3. Set interval: 5 minutes

**Option B: Cron-job.org**
1. Go to [cron-job.org](https://cron-job.org)
2. Create cronjob: `https://your-app-name.onrender.com/health`
3. Set schedule: Every 5 minutes

**Option C: GitHub Actions**
1. Add secret `RENDER_SERVICE_URL` in your GitHub repo
2. The workflow will ping automatically every 5 minutes

## 📊 Monitor Your Service

Once deployed, visit these endpoints:

- **Health Check:** `https://your-app-name.onrender.com/health`
- **Status Dashboard:** `https://your-app-name.onrender.com/status`
- **Schedule Info:** `https://your-app-name.onrender.com/schedule`
- **Manual Trigger:** `POST https://your-app-name.onrender.com/trigger`

## 🎯 What You Get

✅ **24/7 Automation** - Runs 6 videos per day automatically  
✅ **Free Hosting** - No cost for basic usage  
✅ **Background Ping** - Keeps service active  
✅ **Health Monitoring** - Real-time status tracking  
✅ **Manual Control** - Trigger videos on demand  
✅ **Error Handling** - Automatic retries and logging  
✅ **No Mac Required** - Runs in the cloud  

## 🔧 Configuration

Change settings via environment variables in Render dashboard:

```bash
# Schedule frequency
CRON_SCHEDULE_TYPE=threePerDay    # 3 videos/day
CRON_SCHEDULE_TYPE=sixPerDay      # 6 videos/day (default)

# Timezone
TZ=America/New_York
TZ=Europe/London
TZ=Asia/Dubai
```

## 🚨 Important Notes

- **Free tier:** Service may sleep after 15 minutes of inactivity
- **Ping frequency:** Keep pings every 5 minutes for best results
- **Cold starts:** Service may take 30-60 seconds to wake up
- **Logs:** Check Render dashboard for detailed logs

## 🎉 You're Done!

Your YouTube automation will now:
- Generate and upload 6 videos per day automatically
- Run 24/7 without your Mac being on
- Stay active with background pings
- Provide monitoring and control endpoints
- Handle errors gracefully

**Total cost: $0/month** 🎉

---

**Need help?** See `RENDER_SETUP.md` for detailed instructions. 