 <div align="center">

# 🌾 KisanSathi

### *Less Waiting, More Growing.*

**A smart digital queue management platform for farmers visiting agricultural mandis and procurement centres.**

Book a token online · Track your queue · Reach the counter when your turn is near

<br />

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20KisanSathi-2E7D32?style=for-the-badge&logo=vercel&logoColor=white)](https://kisan-sarthi-beryl.vercel.app/)
[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

</div>

---

## 🚀 Live demo

Try the deployed application:

<div align="center">

### [🌐 Open KisanSathi](https://kisan-sarthi-beryl.vercel.app/)

**https://kisan-sarthi-beryl.vercel.app/**

</div>

---

## 🎯 Problem statement

Farmers visiting mandis and government procurement centres can spend a significant part of their day waiting in physical queues. They often have little information about the number of people ahead of them or when their turn will arrive.

**KisanSathi brings the queue online.** Farmers can register, explore service centres, book a token and follow their queue status from a web application. Operators can manage counter activity, while administrators can manage the platform.

## 💡 What KisanSathi offers

- **Digital token booking:** Book a token for an available centre and service.
- **Queue visibility:** View token status and queue information from the farmer interface.
- **Farmer-friendly experience:** A dedicated registration and farmer-facing journey.
- **Operator workspace:** A separate interface for counter operations.
- **Administration:** Dedicated admin screens for platform management.
- **Responsive interface:** A modern React-based web experience.
- **Bilingual experience:** English and Hindi language support in the application.

---

## 📸 Application screenshots

The screenshots below are linked directly to the image files stored in the repository's `screenshots/` folder.

### 🏠 Landing page

<div align="center">
  <img src="screenshots/Landing_Page.png" alt="KisanSathi landing page" width="92%" />
  <p><em>Introduction to KisanSathi and its farmer-focused digital queue experience.</em></p>
</div>

### 📝 Registration page

<div align="center">
  <img src="screenshots/Registration_Page.png" alt="KisanSathi registration page" width="92%" />
  <p><em>Registration interface for users joining the platform.</em></p>
</div>

### 🧑‍🌾 Farmer dashboard

<div align="center">
  <img src="screenshots/Farmer_Page.png" alt="KisanSathi farmer dashboard" width="92%" />
  <p><em>Farmer-facing view for accessing the platform's services and token journey.</em></p>
</div>

### 🧑‍💼 Operator dashboard

<div align="center">
  <img src="screenshots/Operator_Page.png" alt="KisanSathi operator dashboard" width="92%" />
  <p><em>Dedicated operator interface for managing counter operations.</em></p>
</div>

### 🛡️ Admin dashboard

<div align="center">
  <img src="screenshots/Admin_page.png" alt="KisanSathi admin dashboard" width="92%" />
  <p><em>Administrative interface for managing the application.</em></p>
</div>

---

## 🏗️ System design

### High-level architecture

<div align="center">
  <img src="screenshots/architecture.png" alt="KisanSathi system architecture diagram" width="95%" />
</div>

### Token lifecycle

<div align="center">
  <img src="screenshots/token-lifecycle.png" alt="KisanSathi token lifecycle diagram" width="85%" />
</div>

---

## 🛠️ Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite 8 |
| Styling | Tailwind CSS 4 |
| Routing | React Router |
| HTTP client | Axios |
| UI and animation | Framer Motion, Lucide React, DotLottie React |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Token (JWT), bcryptjs |
| Security and validation | Helmet, CORS, express-validator |

---

## 📁 Project structure

```text
KisanSarthi/
├── client/
│   ├── public/
│   │   ├── animations/
│   │   ├── images/
│   │   └── ...
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Application context providers
│   │   ├── layouts/          # Page layouts
│   │   ├── pages/            # Application pages
│   │   ├── assets/           # Frontend assets
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Authentication, validation and errors
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API route definitions
│   │   ├── seeds/            # Database seed scripts
│   │   ├── scripts/          # Utility scripts
│   │   ├── services/         # Queue and ETA business logic
│   │   ├── utils/            # Shared utilities
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── screenshots/
│   ├── Landing_Page.png
│   ├── Registration_Page.png
│   ├── Farmer_Page.png
│   ├── Operator_Page.png
│   ├── Admin_page.png
│   ├── architecture.png
│   └── token-lifecycle.png
│
├── FRONTEND_SPEC.md
└── README.md
```

---

## ⚙️ Run locally

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (prefer an active LTS release)
- npm (included with Node.js)
- [MongoDB](https://www.mongodb.com/) local instance or MongoDB Atlas connection string
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Maverickcodes-sketch/KisanSarthi.git
cd KisanSarthi
```

### 2. Configure the backend

```bash
cd server
npm install
```

Create your local environment file from the example:

**Linux / macOS**
```bash
cp .env.example .env
```

**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

Update `server/.env` with your own values:

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Runtime environment, for example `development` |
| `PORT` | Backend port (example: `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `CLIENT_URL` | Frontend origin allowed by the backend (example: `http://localhost:5173`) |
| `JWT_SECRET` | Long, random secret used to sign authentication tokens |
| `JWT_EXPIRES_IN` | Token expiry duration (example: `7d`) |

Generate a strong JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> **Important:** Keep your real `.env` file and credentials private. Never commit secrets or production database credentials to Git.

### 3. (Optional) Seed the database

The backend includes seed scripts. Run the relevant scripts from the `server/` directory:

```bash
npm run seed
npm run seed:farmers
```

The `seed` command runs the user and demo-data seed scripts. The farmers command adds the farmer demo data. Review the seed files before running them against a database containing information you need to preserve.

### 4. Start the backend

From the `server/` directory:

```bash
npm run dev
```

The API uses the port configured in `server/.env` (typically `http://localhost:5000`).

### 5. Start the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Vite will print the local development URL in the terminal (typically **http://localhost:5173**).

### 6. Build the frontend

To create a production build:

```bash
cd client
npm run build
```

To run the linter:

```bash
npm run lint
```

---

## 📜 Available scripts

### Backend (`server/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with Nodemon |
| `npm start` | Start the API with Node.js |
| `npm run seed` | Run user and demo-data seed scripts |
| `npm run seed:users` | Seed user records |
| `npm run seed:demo` | Seed demo centres, services and related data |
| `npm run seed:farmers` | Seed demo farmer records |
| `npm run check:queue` | Run the queue-check utility |

### Frontend (`client/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the frontend for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## 🔐 Environment and security notes

- Do not upload `.env`, API secrets, JWT secrets or database credentials.
- Use a separate MongoDB database for local development and testing.
- Configure the production frontend origin in the backend's `CLIENT_URL`.
- Use strong, unique credentials for deployed environments.
- Review demo seed accounts and change or remove default credentials before deploying a public instance.

---

## 👥 Team

This project was developed as a collaborative academic project.

| Contributor |
| --- |
| Tanya Vaish |
| Teena Yadav |
| Shaswat Mishra |
| Saumya Tiwari |

---

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes with a clear message.
4. Push your branch and open a pull request.

---

## 📬 Links

- **Live application:** [https://kisan-sarthi-beryl.vercel.app/](https://kisan-sarthi-beryl.vercel.app/)
- **Source code:** [https://github.com/Maverickcodes-sketch/KisanSarthi](https://github.com/Maverickcodes-sketch/KisanSarthi)

---

<div align="center">

### 🌾 KisanSathi — Less Waiting, More Growing.

*Making mandi visits more predictable through a digital queue experience.*

</div>
