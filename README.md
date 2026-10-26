# KisanSathi

Dynamic queue management system for farmers. "Less Waiting, More Growing."

KisanSathi helps farmers avoid long waits at mandis and government procurement centers by booking virtual queue tokens and tracking live queue positions.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Auth: JWT and bcrypt
- Real-time: Socket.IO
- Charts: Recharts

## Setup

### Server

    cd server
    npm install
    copy .env.example .env
    npm run dev

Then edit `server/.env` and set your `MONGO_URI`.

### Client

    cd client
    npm install
    npm run dev

The client runs at http://localhost:5173 and the API at http://localhost:5000.