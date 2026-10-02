# Chat relay (Go + MongoDB + Telegram)

1. In Telegram, message @BotFather, send /newbot, and copy the bot token.
2. Open your new bot and press Start. Get your own id by messaging @userinfobot; that is OWNER_CHAT_ID.
3. Create a MongoDB database (MongoDB Atlas free tier works) and copy its connection string.
4. Deploy this folder (Dockerfile included) to Render, Railway or Fly.io and set the variables from `.env.example`.
   Set PUBLIC_URL to the URL your host gives you. The server then registers the Telegram webhook by itself.
5. In the website project, set `VITE_CHAT_API` to that same URL (in Vercel: Project Settings, Environment Variables), then redeploy.

Local test: `cd server && go mod tidy && go run .` (export the variables first; Telegram needs a public URL for the webhook, so use a tunnel such as ngrok for PUBLIC_URL).

Answering: each visitor message arrives in your bot chat. Swipe-reply to it and your answer shows up in that visitor's chat widget within a few seconds.
Never commit your real `.env` or bot token.
