# Quick Start: AI Writing Assistant

## 🚀 Get Started in 3 Steps

### Step 1: Get Your API Key (2 minutes)
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)

### Step 2: Add to Environment File (1 minute)
Open `.env.local` and replace `your_gemini_api_key_here` with your actual key:

```env
VITE_GEMINI_API_KEY=AIzaSyC...your_actual_key_here
```

### Step 3: Restart Server
```bash
npm run dev
```

## ✨ How to Use

1. Go to **Create Campaign** (Fundraising or Blood Donation)
2. Type your title or description
3. Click the **"✨ Improve with AI"** button
4. Review suggestions and click **"Apply This"** to use one
5. Done! Continue editing or submit your campaign

## 💡 Tips

- The AI works best with at least a sentence or two
- You can use AI suggestions multiple times
- Feel free to edit the AI-generated text
- Works for both titles and descriptions

## ⚠️ Troubleshooting

**Button is disabled?**
- Make sure you've typed some text first

**"API key not configured" error?**
- Check that you added the key to `.env.local`
- Restart your dev server
- Make sure the key is correct (no extra spaces)

**"Failed to get suggestions" error?**
- Check your internet connection
- Verify your API key is valid
- You might have hit the rate limit (15 requests/minute) - wait a moment

## 📚 More Info

See `AI_WRITING_ASSISTANT.md` for detailed documentation.
