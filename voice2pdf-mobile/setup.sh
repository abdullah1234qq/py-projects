#!/usr/bin/env bash

# Voice2PDF Mobile App - Setup Script
# This script helps you set up the React Native app

echo "🚀 Voice2PDF Mobile Setup"
echo "========================"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node -v)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully!"
echo ""

# Check if expo-cli is available
if ! command -v expo &> /dev/null; then
    echo "⚠️  Expo CLI not found globally. Installing..."
    npm install -g expo-cli
fi

echo "✅ Expo CLI available"
echo ""

# Display next steps
echo "🎯 Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. ⚙️  Configure Backend URL:"
echo "   Edit: config.js"
echo "   Update: BACKEND.BASE_URL = 'http://YOUR_LOCAL_IP:8000'"
echo ""
echo "2. 🚀 Start the app:"
echo "   npm start"
echo "   or"
echo "   expo start"
echo ""
echo "3. 📱 Select platform:"
echo "   - Press 'a' for Android"
echo "   - Press 'i' for iOS"
echo "   - Press 'w' for Web"
echo ""
echo "4. 🐛 View debug logs:"
echo "   - Open any screen in the app"
echo "   - Tap '🐛 View Logs' button"
echo ""
echo "5. 📖 Read documentation:"
echo "   - IMPLEMENTATION_GUIDE.md - Complete guide"
echo "   - TROUBLESHOOTING.md - Error solutions"
echo ""
echo "🎉 Happy coding!"
