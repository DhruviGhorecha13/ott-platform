# StreamHub — OTT Streaming Platform (MERN)

A JioHotstar/Netflix-style streaming platform built with MongoDB, Express, React, and Node.

## Offline catalog (important — read this first)

The movie/TV catalog is served entirely from a **local, offline dataset** (`backend/data/movies.json`) — not from a live external API. This was a deliberate choice: college/exam networks often block outbound calls to external APIs, and a live TMDb integration risks failing silently during a demo. This version needs **zero internet access to run the catalog** — the only thing that needs to work is your MongoDB connection (for auth and the watchlist).

- **33 titles use generated placeholder art**: genre-colored SVG posters/backdrops with the title on them, plus a short (6s) synthetic video clip (colored background + title text, made with `ffmpeg`) — not real movie assets, since real posters and licensed footage can't legally be bundled or fetched offline.
- **4 titles use 100% real, legally-licensed media**: *Big Buck Bunny*, *Elephants Dream*, *Sintel*, and *Tears of Steel* — open-source animated/CG short films from the **Blender Foundation**, released under a **Creative Commons Attribution license**. These use the real official poster art and a real ~15-second clip trimmed from the actual film. They're marked with a "Full clip" badge in the UI. Full attribution:
  - *Big Buck Bunny* (c) 2008, Blender Foundation, bigbuckbunny.org — CC BY 3.0
  - *Elephants Dream* (c) 2006, Blender Foundation, elephantsdream.org — CC BY
  - *Sintel* (c) 2010, Blender Foundation, sintel.org — CC BY
  - *Tears of Steel* (c) 2012, Blender Foundation, tearsofsteel.org — CC BY 3.0
- To regenerate the placeholder images after editing `data/movies.json`, run `node scripts/generateImages.js` from inside `backend/`. To regenerate the synthetic video clips, run `node scripts/generateVideos.js` (requires `ffmpeg` on PATH). Both scripts automatically skip the 4 real-media titles and never overwrite them.

If you later deploy this somewhere with reliable internet (e.g. for a portfolio), you could swap `movieRoutes.js` back to calling a live API for real posters across the board — but for exam/demo purposes, this offline mix is the safer default.

## Features

- Browse trending, popular, top-rated movies and popular TV shows in horizontal scroll rows
- Hero banner spotlighting a trending title
- Title detail page: overview, cast, similar titles
- Search across movies and TV shows
- Signup / Login (JWT-based auth)
- Personal "My List" (watchlist) backed by MongoDB — this is the part that proves full-stack CRUD, not just a static data wrapper

## Stack

- **Frontend:** React (Vite) + MUI + React Router
- **Backend:** Node + Express
- **Database:** MongoDB (Atlas or local) via Mongoose
- **Auth:** JWT + bcrypt password hashing
- **Verification:** six-digit, expiring email code required before a JWT is issued
- **Data source:** local static dataset (`backend/data/movies.json`) + generated placeholder images
- **Payments:** Razorpay Checkout with server-side signature verification

## Project structure

```
ott-platform/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── data/movies.json          # offline catalog: titles, genres, cast, ratings
│   ├── scripts/generateImages.js # generates placeholder poster/backdrop SVGs
│   ├── public/images/            # generated posters/ and backdrops/, served statically
│   ├── models/User.js            # User schema + watchlist subdocs
│   ├── middleware/authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js         # signup / login / me
│   │   ├── movieRoutes.js        # serves the local catalog (trending, popular, search, details...)
│   │   └── watchlistRoutes.js
│   └── server.js
└── frontend/
    └── src/
        ├── api/                   # axios instance + API call helpers
        ├── components/            # Navbar, HeroBanner, MovieRow, MovieCard, ProtectedRoute
        ├── context/AuthContext.jsx
        ├── pages/                 # Home, Login, Signup, MovieDetail, Search, MyList
        ├── theme.js
        ├── App.jsx
        └── main.jsx
```

## Setup

### 1. Set up MongoDB — Atlas (cloud) and/or local

You can run this two ways. Keeping both configured (Atlas as primary, local as a commented-out backup in `.env`) is the safest option if you're demoing on a network you can't test in advance.

**Option A — MongoDB Atlas (cloud):**
1. Go to https://www.mongodb.com/cloud/atlas → sign up
2. Create a free **M0** cluster
3. Under **Database Access**, add a database user (username + password — avoid `@` or other special characters in the password to sidestep URL-encoding issues)
4. Under **Network Access**, click "Add IP Address" → "Allow Access from Anywhere" (adds `0.0.0.0/0`) — needed since your IP may change between now and demo day
5. Click **Connect → Drivers**, copy the connection string:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   Add a database name before the `?`, e.g. `.../ott-platform?retryWrites=...`

**Option B — Local MongoDB (safer if you can't test the demo network in advance):**
1. Install MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Default install, no configuration needed — it runs as a background service
3. Connection string is simply: `mongodb://localhost:27017/ott-platform`

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
```
Edit `.env` and fill in:
- `MONGO_URI` — your Atlas or local connection string (see `.env.example` for the primary/backup pattern — comment/uncomment to switch, then restart the server for it to take effect)
- `JWT_SECRET` — any random long string (e.g. run `openssl rand -hex 32`, or `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` if openssl isn't available)

Run it:
```bash
npm run dev
```
Server starts on `http://localhost:5000`. Visit it in a browser — you should see `{"message":"OTT Streaming Platform API is running"}`.

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
```
`.env` already points at `http://localhost:5000/api` — leave as is for local dev.

Run it:
```bash
npm run dev
```
Visit `http://localhost:5173`.

## How the pieces fit together

1. **Catalog data** — the frontend calls your own backend (`/api/movies/...`), which reads from the local `data/movies.json` file. No external calls happen at all for browsing, searching, or viewing details.
2. **Images** — poster/backdrop SVGs are generated once (already done, checked into the project) and served statically by Express from `/images/...`.
3. **Auth** — signup/login return a JWT, stored in `localStorage`. Every subsequent API call attaches it as `Authorization: Bearer <token>` via an axios interceptor.
4. **Watchlist** — stored as a subdocument array directly on the `User` model in MongoDB. This is the clearest "full stack" piece of the project: it's real data you own, not just a static wrapper.

## Admin and email verification

Set `ADMIN_EMAIL` in `backend/.env`. That single email is the only account that receives the `admin` role. Admin users sign in through the same login screen, verify the six-digit email code, and are then taken to `/admin`, where they can create, edit, and delete movie or TV catalog entries. All admin API requests require the JWT and the server checks the role.

Set the `SMTP_*` values in `backend/.env` to send verification codes through your email provider. Your existing `EMAIL_*` names are also supported. If SMTP is not configured, the backend logs codes for local development only; configure SMTP before sharing the app.

OMDb is supported for posters and metadata: add `OMDB_API_KEY` to `backend/.env`, restart the backend, log in using the email configured as `ADMIN_EMAIL`, and click **Sync OMDb posters** on `/admin`. OMDb does not provide video clips. To populate official embeddable YouTube trailers without TMDb, create a YouTube Data API v3 key, add `YOUTUBE_API_KEY` to `backend/.env`, and click **Sync YouTube trailers** on `/admin`. The app stores trailer URLs only; it does not download or redistribute copyrighted films. Add Razorpay test credentials (`RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`) to enable test checkout; the backend verifies every payment signature before unlocking the catalog.

## Subscription plans

Users must sign in before browsing. Signed-in users without an active subscription can browse the first 10 catalog titles. Razorpay test checkout offers 1 month for ₹500, 6 months for ₹2,500, and 12 months for ₹5,000. A verified payment stores the plan and expiry in MongoDB and unlocks the complete catalog.

## Ideas if you have extra time before submission

- Add genre filter chips on the Home page (`/api/movies/genre/:id` already exists on the backend)
- Add a "Continue Watching" row using the `watchHistory` array already scaffolded on the User model
- Deploy: frontend to Vercel/Netlify, backend to Render/Railway, DB on Atlas — for a portfolio version, once offline reliability isn't a constraint
- Add a loading skeleton instead of a spinner for a more polished feel

## Troubleshooting notes from setup

- **`MongoDB connection error: uri parameter must be a string, got undefined`** — `.env` doesn't exist yet (only `.env.example` does), or `npm run dev` was run from the wrong folder. Must run from inside `backend/`.
- **Duplicate `MONGO_URI=MONGO_URI=...`** — happens from copy-pasting into an existing line instead of replacing it. Keep only one `MONGO_URI=` per active line.
- **Password containing `@`** — breaks the URI, since `@` separates credentials from the host. Either avoid special characters when creating the Atlas password, or URL-encode them (`@` → `%40`).
- **`Could not connect to any servers in your MongoDB Atlas cluster`** — usually an IP whitelist issue (add `0.0.0.0/0` under Network Access) or the current network blocking outbound MongoDB traffic entirely (common on some campus Wi-Fi) — test with a mobile hotspot to isolate which one it is. If the network block is the cause, use local MongoDB instead (see Option B above).
