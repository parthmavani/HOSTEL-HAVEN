<<<<<<< HEAD
# 🛡️ Hostel Haven - Premium Hostel Management System

A state-of-the-art, full-stack hostel management solution designed for students, parents, and administrative staff. Built with a focus on premium aesthetics, security, and seamless user experience.

## 🚀 Tech Stack

### Frontend (Modern Web Core)
- **Framework:** [React 18](https://reactjs.org/) with [Vite](https://vitejs.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for utility-first design
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/) (built on [Radix UI](https://www.radix-ui.com/))
- **State & Data Fetching:** [TanStack Query v5](https://tanstack.com/query/latest) (React Query)
- **Form Management:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) validation
- **Routing:** [React Router v6](https://reactrouter.com/)
- **Icons & Visuals:** [Lucide React](https://lucide.dev/) & [Recharts](https://recharts.org/) for data visualization
- **Feedback:** [Sonner](https://sonner.stevenly.me/) for elegant toast notifications
- **Utilities:** `date-fns`, `clsx`, `tailwind-merge`

### Backend (Robust API Layer)
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MySQL](https://www.mysql.com/) with `mysql2` driver
- **Security:** 
  - [JWT](https://jwt.io/) for secure authentication
  - [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js) for password hashing
  - `express-rate-limit` for DDoS protection
  - `CORS` enabled for frontend-backend communication
- **File Handling:** [Multer](https://github.com/expressjs/multer) for multi-part form data/uploads
- **Communication:** [Nodemailer](https://nodemailer.com/) for automated email notifications

## 📂 Project Structure

```text
hostel-haven/
├── frontend/             # Vite + React + TS Frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components (Shadcn)
│   │   ├── pages/        # Dashboard & Main views
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utility functions & API clients
├── backend/              # Express.js Backend
│   ├── controllers/      # Route controllers (logic)
│   ├── routes/           # API Endpoints
│   ├── scripts/          # DB initialization & utility scripts
│   └── server.js         # Entry point
└── sql/                  # Database schemas & constraints
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL Database

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd hostel-haven
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create a .env file with your DB credentials
   npm run init-db  # Initialize MySQL schema
   npm run dev      # Start dev server
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev      # Start Vite development server
   ```

## ✨ Key Features
- **Role-Based Dashboards:** Specific views for Students, Parents, Wardens, and Admins.
- **Leave Management:** Streamlined leave request/approval workflow.
- **Real-time Analytics:** Visual insights using Recharts.
- **Secure Auth:** JWT-protected routes and password hashing.
- **PWA Ready:** Installable application with offline support.
- **Responsive Design:** Optimized for mobile and desktop displays.
=======
# HOSTEL-HAVEN
>>>>>>> bc2b06ea014333b5bfa30627ee19c510df7b7c6b
