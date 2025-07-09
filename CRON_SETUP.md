# YouTube Automation Cron Job Setup

This guide will help you set up your YouTube automation app to run automatically 6 times per day using cron jobs.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Cron Scheduler

```bash
npm run cron start
```

This will start the automation system that generates and uploads 6 videos per day automatically.

## 📅 Schedule Configuration

### Default Schedule (6 videos per day)
- **6:00 AM** - First video
- **10:00 AM** - Second video  
- **2:00 PM** - Third video
- **6:00 PM** - Fourth video
- **10:00 PM** - Fifth video
- **2:00 AM** - Sixth video (next day)

### Alternative Schedules

You can change the schedule by setting the `CRON_SCHEDULE_TYPE` environment variable:

```bash
# 3 videos per day
export CRON_SCHEDULE_TYPE=threePerDay

# 4 videos per day  
export CRON_SCHEDULE_TYPE=fourPerDay

# 8 videos per day
export CRON_SCHEDULE_TYPE=eightPerDay
```

### Custom Timezone

Set your timezone using the `TZ` environment variable:

```bash
export TZ="America/New_York"
export TZ="Europe/London"
export TZ="Asia/Dubai"
```

## 🛠️ Available Commands

### Cron Scheduler Commands

```bash
# Start the cron scheduler (runs continuously)
npm run cron start

# Show current schedule
npm run cron schedule

# Show upload statistics
npm run cron stats

# Run a single automation job manually
npm run cron run

# Clean up old files
npm run cron cleanup
```

### Monitoring Commands

```bash
# Start real-time monitoring dashboard
npm run monitor dashboard

# Show current system status
npm run monitor status

# Show recent errors
npm run monitor errors

# Generate daily report
npm run monitor report
```

### Manual Automation

```bash
# Run single automation job
npm run automate
```

## 📊 Monitoring & Logs

### Log Files Location
All logs are stored in the `logs/` directory:

- `logs/combined.log` - All automation logs
- `logs/error.log` - Error logs only
- `logs/cron-combined.log` - Cron scheduler logs
- `logs/cron-error.log` - Cron error logs
- `logs/monitor.log` - Monitoring logs
- `logs/upload-history.json` - Upload history and statistics
- `logs/reports/` - Daily reports

### Real-time Dashboard

Start the monitoring dashboard to see real-time status:

```bash
npm run monitor dashboard
```

This will show:
- Current system status
- Today's upload count
- Recent uploads
- Error reports
- System health indicators

## 🔧 Production Deployment

### Using PM2 (Recommended)

Install PM2 globally:
```bash
npm install -g pm2
```

Create a PM2 ecosystem file (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'youtube-automation',
    script: 'src/cronScheduler.js',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      TZ: 'UTC'
    }
  }]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Using Systemd (Linux)

Create a systemd service file (`/etc/systemd/system/youtube-automation.service`):
```ini
[Unit]
Description=YouTube Automation Cron Scheduler
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/youtube-automation-app
ExecStart=/usr/bin/node src/cronScheduler.js start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=TZ=UTC

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl enable youtube-automation
sudo systemctl start youtube-automation
sudo systemctl status youtube-automation
```

## 🚨 Error Handling & Recovery

### Automatic Retry Logic
The system includes automatic retry logic:
- Up to 3 retry attempts per job
- Exponential backoff between retries
- Maximum 30-second wait between retries

### Error Monitoring
Check for errors:
```bash
npm run monitor errors
```

### Manual Recovery
If the system stops working:
1. Check logs: `tail -f logs/error.log`
2. Restart the scheduler: `npm run cron start`
3. Run manual test: `npm run cron run`

## 📈 Performance Optimization

### File Cleanup
The system automatically cleans up old files:
- Runs daily at 3 AM
- Removes files older than 7 days
- Keeps upload history for 100 entries

### Manual Cleanup
```bash
npm run cron cleanup
```

## 🔐 Security Considerations

### Environment Variables
Make sure your `.env` file contains all necessary API keys:
```bash
OPENAI_API_KEY=your_openai_key
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REFRESH_TOKEN=your_youtube_refresh_token
# ... other required keys
```

### File Permissions
Ensure proper file permissions:
```bash
chmod 600 .env
chmod 755 logs/
```

## 📱 Notifications (Optional)

You can add notification support by modifying `automationRunner.js` to send notifications via:
- Email
- Slack
- Discord
- Telegram

## 🐛 Troubleshooting

### Common Issues

1. **Cron jobs not running**
   - Check timezone settings
   - Verify cron syntax
   - Check system logs

2. **YouTube upload failures**
   - Verify YouTube API credentials
   - Check quota limits
   - Review error logs

3. **Video generation failures**
   - Check API keys (OpenAI, Stability AI)
   - Verify disk space
   - Check network connectivity

### Debug Mode
Enable debug logging by setting:
```bash
export DEBUG=true
```

### Manual Testing
Test individual components:
```bash
# Test story generation
node src/storyGenerator.js

# Test video creation
node src/testVideoCreation.js

# Test YouTube upload
node src/testYouTubeAuth.js
```

## 📞 Support

If you encounter issues:
1. Check the logs in `logs/` directory
2. Run `npm run monitor status` for system status
3. Review this documentation
4. Check your API quotas and credentials

## 🎯 Success Metrics

Monitor your automation success:
- **Success Rate**: Should be >90%
- **Daily Uploads**: Should be 6/6
- **Error Rate**: Should be <10%
- **Average Duration**: Should be <10 minutes per video

Use the monitoring dashboard to track these metrics in real-time! 