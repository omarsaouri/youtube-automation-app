#!/bin/bash

# Start the YouTube automation cron scheduler with correct timezone
echo "🚀 Starting YouTube automation cron scheduler..."
echo "📅 Timezone: Europe/London (BST)"
echo "⏰ Current time: $(date)"
echo ""

# Set timezone and start cron scheduler
export TZ=Europe/London
npm run cron start 