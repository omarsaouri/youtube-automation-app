# Render Free Tier Setup Guide

## Overview

This guide explains how to set up your YouTube automation app on Render's free tier and keep it running with external ping services.

## Why Free Tier Has Limitations

Render's free tier has these limitations:

- **Services sleep after 15 minutes of inactivity**
- **No background processes** - service stops when there's no HTTP traffic
- **No worker services** - only web services are supported

## Solution: Free Tier Compatible System

We've implemented a system that:

1. **Keeps the service alive** with periodic HTTP requests
2. **Runs cron jobs when the service is active**
3. **Uses external ping services** to prevent sleep
4. **Provides manual trigger capability**

## Setup Instructions

### 1. Deploy to Render

1. Push your code to GitHub
2. Connect your repository to Render
3. Use the updated `render.yaml` configuration
4. Deploy as a **web service** (not worker)

### 2. Configure Environment Variables

In your Render dashboard, set these environment variables:

- `NODE_ENV`: `production`
- `TZ`: `Europe/London` (or your timezone)
- `PORT`: `10000`
- `CRON_SCHEDULE_TYPE`: `sixPerDay`

### 3. Set Up External Ping Services

To keep your service alive, set up these free external ping services:

#### Option A: UptimeRobot (Recommended)

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Create a free account
3. Add a new monitor:
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://your-app-name.onrender.com/health`
   - **Check Interval**: 5 minutes
   - **Alert When Down**: Yes

#### Option B: Cron-job.org

1. Go to [cron-job.org](https://cron-job.org)
2. Create a free account
3. Add a new cronjob:
   - **URL**: `https://your-app-name.onrender.com/health`
   - **Schedule**: Every 10 minutes
   - **Retry on failure**: Yes

#### Option C: Pingdom

1. Go to [pingdom.com](https://pingdom.com)
2. Create a free account
3. Add a new uptime monitor:
   - **URL**: `https://your-app-name.onrender.com/health`
   - **Check Interval**: 5 minutes

### 4. Monitor Your Service

Once deployed, you can monitor your service at:

- **Dashboard**: `https://your-app-name.onrender.com/`
- **Health Check**: `https://your-app-name.onrender.com/health`
- **Status**: `https://your-app-name.onrender.com/status`

## How It Works

### Free Tier Mode

- **Hourly Automation**: Runs every hour when service is active
- **Keep-Alive Pings**: Internal pings every 10 minutes
- **External Pings**: External services ping every 5-10 minutes
- **Activity Tracking**: Only runs jobs if service has been active recently

### Development Mode

- **Normal Cron**: Uses the original 6-times-per-day schedule
- **No Keep-Alive**: No external pings needed

## Monitoring

### Dashboard Features

- **Real-time Status**: Service health and uptime
- **Manual Trigger**: Run automation manually
- **Upload Statistics**: Success/failure rates
- **Recent Uploads**: List of recent videos
- **Schedule Info**: Current cron schedule

### Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2025-07-12T17:30:32.204Z",
  "uptime": 3600,
  "lastActivity": "2025-07-12T17:30:32.204Z",
  "timeSinceLastActivity": 0,
  "isProduction": true,
  "shouldRunCronJobs": true,
  "stats": {
    "total": 10,
    "successful": 9,
    "failed": 1,
    "successRate": 90
  }
}
```

## Troubleshooting

### Service Not Running

1. Check if external ping services are configured
2. Verify the health check URL is correct
3. Check Render logs for errors

### Cron Jobs Not Executing

1. Ensure service is active (check lastActivity)
2. Verify timezone settings
3. Check if `shouldRunCronJobs` is true

### Manual Trigger Not Working

1. Check if automation dependencies are installed
2. Verify YouTube API credentials
3. Check logs for specific errors

## Expected Behavior

### Free Tier Limitations

- Service may sleep after 15 minutes of inactivity
- Cron jobs only run when service is active
- Maximum 1 automation per hour (when active)

### Performance

- **Uptime**: ~95% with proper ping services
- **Automation Frequency**: 1-6 videos per day (depending on activity)
- **Response Time**: 2-3 minutes for manual triggers

## Cost Optimization

### Free Tier Limits

- **Build Time**: 500 minutes/month
- **Runtime**: 750 hours/month
- **Bandwidth**: 100 GB/month

### Tips

- Use efficient video generation settings
- Optimize thumbnail sizes
- Monitor usage in Render dashboard

## Support

If you encounter issues:

1. Check the dashboard for real-time status
2. Review Render logs in the dashboard
3. Verify external ping services are working
4. Test manual trigger functionality

## Migration to Paid Plan

When ready to upgrade:

1. **Starter Plan** ($7/month): Better uptime, no sleep
2. **Standard Plan** ($25/month): Full cron support, workers
3. **Pro Plan** ($50/month): High performance, dedicated resources

The current system will work on paid plans with better reliability and more frequent automation.
