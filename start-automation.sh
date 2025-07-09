#!/bin/bash

# YouTube Automation Startup Script
# This script starts the YouTube automation cron job system

echo "🎬 YouTube Automation Startup Script"
echo "===================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please make sure you have configured your .env file with all required API keys."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Set default timezone if not set
if [ -z "$TZ" ]; then
    export TZ="UTC"
    echo "🌍 Setting timezone to UTC (use export TZ='your/timezone' to change)"
fi

# Show current configuration
echo ""
echo "📋 Current Configuration:"
echo "   Timezone: $TZ"
echo "   Schedule Type: ${CRON_SCHEDULE_TYPE:-sixPerDay}"
echo ""

# Ask user what they want to do
echo "What would you like to do?"
echo "1. Start cron scheduler (recommended for production)"
echo "2. Run single automation job (for testing)"
echo "3. Show system status"
echo "4. Show current schedule"
echo "5. Start monitoring dashboard"
echo "6. Exit"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting cron scheduler..."
        echo "This will run continuously and generate 6 videos per day automatically."
        echo "Press Ctrl+C to stop."
        echo ""
        npm run cron start
        ;;
    2)
        echo ""
        echo "🎬 Running single automation job..."
        npm run cron run
        ;;
    3)
        echo ""
        echo "📊 System Status:"
        npm run monitor status
        ;;
    4)
        echo ""
        echo "📅 Current Schedule:"
        npm run cron schedule
        ;;
    5)
        echo ""
        echo "📈 Starting monitoring dashboard..."
        echo "Press Ctrl+C to exit."
        npm run monitor dashboard
        ;;
    6)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac 