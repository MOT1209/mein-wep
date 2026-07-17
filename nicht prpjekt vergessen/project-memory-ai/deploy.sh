#!/bin/bash

# This script helps deploy environment variables to Vercel
# Run this after setting your actual API keys

echo "🚀 Deploying AlKing Dashboard to Vercel..."
echo "📝 Please enter your API keys when prompted"

# Read API keys
read -p "Enter OpenRouter API Key: " OPENROUTER_KEY
read -p "Enter Gemini API Key: " GEMINI_KEY

# Update .env.local with actual keys
cat > .env.local << EOL
OPENROUTER_API_KEY=$OPENROUTER_KEY
GEMINI_API_KEY=$GEMINI_KEY
FAL_AI_KEY=
OCR_SPACE_API_KEY=
EOL

echo "✅ Environment variables saved"
echo "🔄 Starting deployment..."

npx vercel --prod --yes

echo "✅ Deployment complete! Visit: https://dashboard77-phi.vercel.app"