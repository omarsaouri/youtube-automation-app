# ✅ Render Deployment Verification Checklist

Use this checklist to verify that both services are deployed and working properly on Render.

## 🌐 Step 1: Check Render Dashboard

### 1.1 Access Render Dashboard

- [ ] Go to https://dashboard.render.com
- [ ] Sign in with your GitHub account
- [ ] Look for your project/account

### 1.2 Verify Both Services Exist

- [ ] **Web Service:** `youtube-automation-web` (should be green/running)
- [ ] **Worker Service:** `youtube-automation-cron` (should be green/running)

### 1.3 Check Service Status

- [ ] Both services show "Live" status
- [ ] No error messages in service overview
- [ ] Last deployment was successful

## ⚙️ Step 2: Verify Worker Service (Cron Jobs)

### 2.1 Check Worker Service Logs

- [ ] Click on `youtube-automation-cron` service
- [ ] Go to "Logs" tab
- [ ] Look for these messages:
  - [ ] `🚀 Starting YouTube automation cron scheduler...`
  - [ ] `🏗️ Running on Render - Production mode enabled`
  - [ ] `📅 Scheduling 6 cron jobs:`
  - [ ] `✅ Scheduled job video-1 with cron: 0 18 * * *`
  - [ ] `✅ Cron scheduler started successfully`

### 2.2 Check Environment Variables (Worker)

- [ ] Go to "Environment" tab in worker service
- [ ] Verify these variables are set:
  - [ ] `NODE_ENV=production`
  - [ ] `TZ=Europe/London`
  - [ ] `CRON_SCHEDULE_TYPE=sixPerDay`
  - [ ] All API keys are present (see full list below)

## 🌐 Step 3: Verify Web Service

### 3.1 Get Your Web Service URL

- [ ] Note the URL from your web service (e.g., `https://youtube-automation-web.onrender.com`)

### 3.2 Test Web Service Endpoints

- [ ] **Health Check:** Visit `YOUR_URL/health`
  - [ ] Returns JSON with status "healthy"
  - [ ] Shows uptime and statistics
- [ ] **Upload Stats:** Visit `YOUR_URL/status`
  - [ ] Shows upload statistics
  - [ ] Displays recent uploads
- [ ] **Schedule:** Visit `YOUR_URL/schedule`
  - [ ] Shows current cron schedule
  - [ ] Displays next run times

### 3.3 Check Environment Variables (Web)

- [ ] Go to "Environment" tab in web service
- [ ] Verify these variables are set:
  - [ ] `NODE_ENV=production`
  - [ ] `TZ=Europe/London`
  - [ ] `PORT=10000`
  - [ ] All API keys are present (see full list below)

## 🔑 Step 4: Required Environment Variables

**Both services must have ALL of these variables:**

### API Keys

- [ ] `OPENAI_API_KEY`
- [ ] `YOUTUBE_CLIENT_ID`
- [ ] `YOUTUBE_CLIENT_SECRET`
- [ ] `YOUTUBE_REFRESH_TOKEN`
- [ ] `STABILITY_API_KEY`
- [ ] `AZURE_SPEECH_KEY`
- [ ] `AZURE_SPEECH_REGION`
- [ ] `AWS_ACCESS_KEY_ID`
- [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] `AWS_REGION`

### Configuration

- [ ] `NODE_ENV=production`
- [ ] `TZ=Europe/London`
- [ ] `CRON_SCHEDULE_TYPE=sixPerDay`
- [ ] `PORT=10000` (web service only)

## 🧪 Step 5: Test Functionality

### 5.1 Manual Upload Test

- [ ] Visit `YOUR_URL/trigger` in browser
- [ ] Or use: `curl -X POST YOUR_URL/trigger`
- [ ] Should start a video upload process
- [ ] Check logs for upload progress

### 5.2 Monitor Cron Job Execution

- [ ] Wait for next scheduled time (check `/schedule` endpoint)
- [ ] Monitor worker service logs
- [ ] Look for: `🎬 Starting scheduled job: video-1`
- [ ] Look for: `✅ Scheduled job video-1 completed successfully`

## 📊 Step 6: Monitoring Setup

### 6.1 External Health Monitoring (Optional)

- [ ] Set up UptimeRobot to ping `YOUR_URL/health`
- [ ] Set up Cron-job.org to ping every 5 minutes
- [ ] Configure notifications for downtime

### 6.2 Log Monitoring

- [ ] Check worker service logs regularly
- [ ] Monitor for error messages
- [ ] Verify cron jobs are executing on schedule

## 🚨 Step 7: Troubleshooting

### 7.1 If Web Service is Down

- [ ] Check build logs for errors
- [ ] Verify all environment variables are set
- [ ] Check if dependencies are installed correctly

### 7.2 If Worker Service is Down

- [ ] Check worker service logs
- [ ] Verify start command: `npm run cron start`
- [ ] Check if all environment variables are set

### 7.3 If Cron Jobs Aren't Running

- [ ] Check worker service logs for cron messages
- [ ] Verify timezone setting matches your location
- [ ] Check if service is active (not suspended)

### 7.4 If Uploads Are Failing

- [ ] Check API keys are valid
- [ ] Verify YouTube API quota
- [ ] Check for error messages in logs

## ✅ Step 8: Success Indicators

Your deployment is successful when:

- [ ] Both services show "Live" status on Render
- [ ] Web service responds to health checks
- [ ] Worker service shows cron job scheduling messages
- [ ] Manual uploads work via `/trigger` endpoint
- [ ] Scheduled uploads execute at the correct times
- [ ] All environment variables are properly set

## 📞 Need Help?

If you encounter issues:

1. **Check Render Documentation:** https://render.com/docs
2. **Review Service Logs:** Look for error messages
3. **Verify Environment Variables:** Ensure all are set correctly
4. **Test Locally First:** Run the app locally to verify functionality

---

**🎉 Congratulations!** If you've checked all the boxes above, your YouTube automation app is successfully deployed on Render with working cron jobs!
