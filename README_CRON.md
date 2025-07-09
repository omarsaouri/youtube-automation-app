# 🎬 YouTube Automation - Cron Job System

Your YouTube automation app is now set up to run automatically 6 times per day! 

## 🚀 Quick Start

### Option 1: Use the startup script (Recommended)
```bash
./start-automation.sh
```

### Option 2: Manual commands
```bash
# Start the cron scheduler (runs 6 videos per day automatically)
npm run cron start

# Run a single test job
npm run cron run

# Monitor the system
npm run monitor dashboard
```

## 📅 Default Schedule

The system will automatically generate and upload videos at:
- **6:00 AM** - Video 1
- **10:00 AM** - Video 2  
- **2:00 PM** - Video 3
- **6:00 PM** - Video 4
- **10:00 PM** - Video 5
- **2:00 AM** - Video 6 (next day)

## 🛠️ Key Features

✅ **Automatic retry logic** - Up to 3 attempts per job  
✅ **Comprehensive logging** - All activities logged to `logs/` directory  
✅ **Real-time monitoring** - Dashboard shows live status  
✅ **Error handling** - Graceful failure recovery  
✅ **File cleanup** - Automatic cleanup of old files  
✅ **Upload tracking** - History of all uploads  
✅ **Flexible scheduling** - Easy to change video frequency  

## 📊 Monitoring

### Real-time Dashboard
```bash
npm run monitor dashboard
```

### Check Status
```bash
npm run monitor status
```

### View Errors
```bash
npm run monitor errors
```

## 🔧 Configuration

### Change Schedule Frequency
```bash
# 3 videos per day
export CRON_SCHEDULE_TYPE=threePerDay

# 4 videos per day  
export CRON_SCHEDULE_TYPE=fourPerDay

# 8 videos per day
export CRON_SCHEDULE_TYPE=eightPerDay
```

### Set Timezone
```bash
export TZ="America/New_York"
export TZ="Europe/London"
export TZ="Asia/Dubai"
```

## 📁 File Structure

```
youtube-automation-app/
├── src/
│   ├── automationRunner.js    # Main automation logic
│   ├── cronScheduler.js       # Cron job scheduler
│   ├── monitor.js             # Monitoring dashboard
│   └── ... (existing files)
├── logs/                      # All logs and history
│   ├── combined.log
│   ├── error.log
│   ├── upload-history.json
│   └── reports/
├── start-automation.sh        # Easy startup script
└── CRON_SETUP.md             # Detailed setup guide
```

## 🚨 Important Notes

1. **Keep the process running** - The cron scheduler needs to stay active
2. **Check logs regularly** - Monitor `logs/error.log` for issues
3. **API quotas** - Ensure you have sufficient API quotas for daily usage
4. **Disk space** - Videos and audio files can use significant space
5. **Internet connection** - Stable connection required for uploads

## 🎯 Success Metrics

Monitor these key metrics:
- **Success Rate**: Should be >90%
- **Daily Uploads**: Should be 6/6
- **Error Rate**: Should be <10%
- **Average Duration**: Should be <10 minutes per video

## 🆘 Troubleshooting

### If videos stop uploading:
1. Check logs: `tail -f logs/error.log`
2. Restart scheduler: `npm run cron start`
3. Test manually: `npm run cron run`

### If you need to stop the system:
- Press `Ctrl+C` to stop the cron scheduler
- Use `./start-automation.sh` to restart

## 📞 Support

For detailed setup instructions, see `CRON_SETUP.md`

For production deployment options, see the deployment section in `CRON_SETUP.md`

---

**🎉 Your YouTube automation is now fully automated!** 

The system will generate and upload 6 videos per day without any manual intervention. Just keep it running and monitor the dashboard to ensure everything is working smoothly. 