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

## Prerequisites

- Node.js 20.19+ (or 22.12+)
- Git
- A MongoDB database (local MongoDB or a free MongoDB Atlas cluster)

## Setup

### 1. Server

    cd server
    npm install
    copy .env.example .env

Open `server/.env` and fill in:

- `MONGO_URI`: your connection string, ending with the database name `kisansathi` (for Atlas: `...mongodb.net/kisansathi?retryWrites=true&w=majority`)
- `JWT_SECRET`: any long random string. Generate one with:

      node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

Never commit `.env`.

### 2. Demo data

Run once from the `server` folder:

    npm run seed

This creates the admin and operator accounts, plus demo centers, services and counters. It is safe to run again.

### 3. Run the server

    npm run dev

The API runs at http://localhost:5000 (health check: http://localhost:5000/api/health).

### 4. Client

In a second terminal:

    cd client
    npm install
    npm run dev

The app runs at http://localhost:5173.

## Demo Accounts

| Role | Login | Password |
| --- | --- | --- |
| Admin | admin@kisansathi.in | admin123 |
| Operator | operator@kisansathi.in | operator123 |
| Operator | operator2@kisansathi.in to operator6@kisansathi.in | operator123 |

Farmers can register from the app.

## Team Workflow

- Pull the latest code before starting: `git pull origin main`
- Work on your own branch: `git checkout -b feature/your-feature-name`
- Commit small changes with clear messages, then push your branch and open a pull request.
- Never commit `.env` or any secrets.