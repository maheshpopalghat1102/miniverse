# MiniVerse

## Local setup

1. Copy `.env.example` to the environment file used by the server and set `MONGODB_URI` plus separate JWT secrets.
2. Copy `client/.env.example` to `client/.env` if the API or Socket.IO server uses a different address.
3. Install dependencies in `server` and `client`.
4. Seed the game catalogue with `npm run seed:games` from the `server` directory. This command is safe to rerun; it updates the catalogue entries by `gameId`.
5. Start the backend and Vite client with `npm run dev` from their respective directories.

Email and Cloudinary settings are optional. Without SMTP, account verification and password reset emails cannot be delivered. Without Cloudinary, image upload endpoints are unavailable.
