# fixNow - Premium On-Demand Home Services Platform

![fixNow Cover Image](https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop)

**fixNow** is a modern, full-stack, on-demand home services platform designed to connect customers with verified, top-rated professionals for everyday needs like plumbing, electrical work, cleaning, and more. 

Built with a focus on premium user experience and robust backend architecture, it mimics the real-world operational flows of platforms like Urban Company and TaskRabbit.

---

## 🌟 Key Features

### For Customers
*   **Smart Search & Booking**: Intelligent search with auto-suggestions, and categorization of services.
*   **Geospatial Auto-Assignment**: Uses MongoDB's `$geoNear` to automatically find and assign the nearest available, verified technician based on the customer's GPS coordinates.
*   **Secure Payments**: Integrated Razorpay payment gateway for seamless checkouts, along with digital wallets and automated invoice generation.
*   **Real-Time Communication**: In-app chat and video call capabilities to discuss job specifics with assigned technicians.
*   **Help & Support Center**: Context-aware ticketing system that automatically links complaints to recent bookings for faster resolution.
*   **Reviews & Ratings**: Transparent rating system ensuring only top-tier professionals remain on the platform.

### For Professionals (Technicians)
*   **Comprehensive Registration**: Multi-step onboarding collecting personal, professional, documentation (Aadhaar/PAN), and banking details.
*   **Dynamic Service Mapping**: Professionals are automatically mapped to all specific services within their chosen category.
*   **Job Management Dashboard**: Accept, track, and manage incoming service requests, view earnings, and manage availability schedules.
*   **Digital Wallet**: Track payouts, service charges, and overall earnings in real-time.

### For Administrators
*   **Centralized Command Center**: Complete oversight of all bookings, users, and financial transactions.
*   **Verification Workflow**: Approve or reject technician profiles based on uploaded documents.
*   **Service & Category Management**: Dynamically add or edit service offerings and pricing models.
*   **Dispute Resolution**: Manage user complaints and oversee support tickets.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React (Vite)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS, PostCSS
*   **Animations**: Framer Motion
*   **Icons**: Lucide React
*   **Routing**: React Router DOM

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Language**: TypeScript
*   **Database**: MongoDB (Mongoose ORM)
*   **Authentication**: JSON Web Tokens (JWT) & bcrypt
*   **Payments**: Razorpay SDK
*   **File Uploads**: Multer
*   **Real-time**: Socket.io

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   MongoDB (Local or Atlas URL)
*   Razorpay Account (for payment gateway API keys)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Arbind43/fixNow.git
   cd fixNow
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory and add your environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```
   Start the backend development server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   Open a new terminal tab:
   ```bash
   cd client
   npm install
   ```
   Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

4. **Access the Application**
   Open your browser and navigate to `http://localhost:5173`.

---

## 📁 Project Structure

```
fixNow/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components & layouts
│   │   ├── context/        # React Context (Auth, Theme)
│   │   ├── pages/          # Page-level components (Public, Auth, Dashboard)
│   │   └── styles/         # Global Tailwind CSS styles
│   └── vite.config.ts      # Vite configuration
│
└── server/                 # Backend Express Application
    ├── src/
    │   ├── controllers/    # Request handlers (Booking, Tech, Admin, etc.)
    │   ├── middleware/     # Auth guards, RBAC, file upload handling
    │   ├── models/         # Mongoose DB Schemas
    │   ├── routes/         # API Route definitions
    │   └── utils/          # Helper functions (JWT, Error Handling)
    └── uploads/            # Local storage for uploaded documents
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
