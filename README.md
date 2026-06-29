# FixNow AI

FixNow AI is a modern, AI-powered service marketplace connecting customers with verified home repair and maintenance technicians. Inspired by platforms like Urban Company and Uber.

## Features (Phase 1)
- Stunning animated Landing Page
- Complete Design System (Tailwind v4)
- Dark Mode support
- Responsive UI across all devices
- Foundational Frontend & Backend Architecture

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS v4, Framer Motion
- **Backend:** Node.js, Express, MongoDB, Mongoose, TypeScript
- **Real-time:** Socket.io, WebRTC (upcoming)
- **AI Integration:** Google Gemini API (upcoming)

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Setup
1. Clone the repository
2. Run `npm run install:all` to install dependencies for both client and server.
3. Copy `.env.example` to `.env` in the root and fill in your values.
4. Run `npm run dev` to start both the frontend and backend servers concurrently.

### Architecture
- `client/` - React frontend
- `server/` - Express backend
