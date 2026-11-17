# SkillLink

SkillLink connects customers with service providers in their community. The
current implementation includes customer/provider registration and password
authentication, with account data stored in MongoDB and sessions managed by
Auth.js.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `MONGODB_URI` to your MongoDB connection string.
4. Replace `AUTH_SECRET` with a randomly generated secret (for example, run
   `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`).
5. Start the app with `npm run dev`, then open
   [http://localhost:3000](http://localhost:3000).

Registration validates account details on the server, stores a bcrypt-hashed
password, and assigns the selected customer or provider role. Login uses
Auth.js Credentials and a JWT-backed session. Never commit `.env.local` or
production secrets.
