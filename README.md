# 🚗 Car Dealership Inventory System (RYDEX)
> A robust, full-stack automotive dealership & inventory management platform built with **Test-Driven Development (TDD)**, **Node.js/Express**, **MongoDB Atlas**, **React 19**, and **Tailwind CSS 4**.

* 🚀 **Frontend URL:** [https://incubyte-car-inventory-system.vercel.app/](https://incubyte-car-inventory-system.vercel.app/)
* ⚙️ **Backend URL:** [https://incubyte-car-inventory-system.onrender.com](https://incubyte-car-inventory-system.onrender.com)

---

## 📸 Application Showcase

<p align="center">
  <img src="screenshots/Screenshot%202026-10-24%20213735.png" width="100%" alt="Showroom Landing Page" />
</p>
<p align="center">
  <img src="screenshots/Screenshot%202026-10-24%20213806.png" width="100%" alt="Vehicle Fleet Catalog" />
</p>
<p align="center">
  <img src="screenshots/Screenshot%202026-10-24%20213815.png" width="100%" alt="Live Search & Filtering" />
</p>
<p align="center">
  <img src="screenshots/Screenshot%202026-10-24%20213826.png" width="100%" alt="Vehicle Details & Specifications" />
</p>
<p align="center">
  <img src="screenshots/Screenshot%202026-10-24%20213849.png" width="100%" alt="Doorstep Delivery & Purchase Form" />
</p>
<p align="center">
  <img src="screenshots/Screenshot%202026-10-24%20213904.png" width="100%" alt="Order Confirmation & Payment Verification" />
</p>
<p align="center">
  <img src="screenshots/Screenshot%202026-10-24%20213940.png" width="100%" alt="My Purchases & Delivery Tracking" />
</p>
<p align="center">
  <img src="screenshots/Screenshot%202026-10-24%20213953.png" width="100%" alt="Official Tax Invoice Modal" />
</p>
<p align="center">
  <img src="screenshots/Screenshot%202026-10-24%20214021.png" width="100%" alt="Admin Vehicle Management Dashboard" />
</p>
<p align="center">
  <img src="screenshots/Screenshot%202026-10-24%20214031.png" width="100%" alt="Admin Add Vehicle Form" />
</p>
<p align="center">
  <img src="screenshots/Screenshot%202026-10-24%20214043.png" width="100%" alt="Admin Live Stock & Pricing Controls" />
</p>
<p align="center">
  <img src="screenshots/Screenshot%202026-10-24%20214053.png" width="100%" alt="Admin Customer Order Management" />
</p>

---

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_Cloud-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Jest Tests](https://img.shields.io/badge/Tests-25%2F25_Passing-brightgreen?logo=jest&logoColor=white)](https://jestjs.io/)
[![TDD](https://img.shields.io/badge/Methodology-TDD_(Red--Green--Refactor)-blueviolet)](#test-driven-development-tdd--test-suite)

---

## 📌 Table of Contents
1. [Overview](#-overview)
2. [Core Architecture & Tech Stack](#-core-architecture--tech-stack)
3. [Key Features](#-key-features)
4. [Complete RESTful API Specification](#-complete-restful-api-specification)
5. [Test-Driven Development (TDD) & Test Suite](#-test-driven-development-tdd--test-suite)
6. [My AI Usage (Incubyte AI Collaboration Reflection)](#-my-ai-usage)
7. [Step-by-Step Setup & Installation](#-step-by-step-setup--installation)
8. [Environment Variables](#-environment-variables)
9. [Project Directory Structure](#-project-directory-structure)

---

## 🌟 Overview
The **Car Dealership Inventory System** is engineered to deliver a dealership-grade experience for vehicle browsing, real-time stock management, and customer purchases. Built following strict **Test-Driven Development (TDD)** practices, every backend capability—from authentication and vehicle cataloging to inventory stock decrement and admin restocking—is backed by comprehensive automated test suites.

---

## 🛠 Core Architecture & Tech Stack

| Layer | Technologies & Libraries | Purpose |
| :--- | :--- | :--- |
| **Backend API** | Node.js (ES Modules), Express 5 | RESTful API server, routing, and controller layer |
| **Database** | MongoDB Atlas with Mongoose ORM | Persistent cloud database with direct replica-set resilience |
| **Authentication**| JWT (JSON Web Tokens), Bcrypt.js | Stateless bearer authentication and secure password hashing |
| **File Storage** | Multer | Multipart form-data handling for vehicle image uploads |
| **Security** | Helmet, CORS, DNS Resilient Fallback | Cross-Origin resource sharing and network timeout safeguards |
| **Testing** | Jest, Supertest, Cross-Env | Automated TDD unit & integration test runner |
| **Frontend SPA** | React 19, Vite, React Router 7 | High-performance Single Page Application (SPA) |
| **Styling** | Tailwind CSS 4, Lucide Icons, React Icons | Modern dark-mode aesthetics, glassmorphism, responsive grid |
| **Payments** | Stripe Checkout API | Payment gateway integration with automated order confirmation |

---

## 🚀 Key Features

### 👤 Customer Experience
* **Live Fleet Discovery:** Browse the full showroom with high-resolution imagery, seating capacity, transmission, powertrain specs, and authentic Indian Rupee ex-showroom valuations.
* **Instant Multi-Parameter Search & Filter:** Filter fleet in real time by:
  * Full-text search (Make, Model, Keywords)
  * Segment / Category (Sedan, SUV, Luxury, Electric)
  * Price Range boundaries (Min Price & Max Price)
  * "In Stock Only" availability toggle
* **Stock-Aware Purchase Button:**
  * When a vehicle has stock (`quantity > 0`), the button allows purchasing and displays live available units.
  * When stock reaches zero (`quantity === 0`), the button is **automatically disabled**, displays `"OUT OF STOCK"`, and prevents purchase transactions.
* **Streamlined Checkout:**
  * Pre-filled address forms with standard defaults.
  * Instant checkout option or full Stripe redirect with automatic verification.
* **Order History & Invoicing:**
  * Dedicated **"My Purchases"** tracking view.
  * Doorstep delivery status, transaction IDs, and an official **Printable Tax Invoice Modal**.

### 🛡 Admin Inventory Management
* **Inventory Dashboard:** Real-time visibility into total fleet value, active bookings, and individual vehicle stock counts.
* **Vehicle Addition (`POST /api/vehicles`):** Form interface with file upload for adding new models to inventory.
* **Live Stock Restocking (`POST /api/vehicles/:id/restock`):** Increase inventory quantities directly from the dashboard.
* **Vehicle Update & Deletion (`PUT` & `DELETE`):** Edit pricing, specifications, or remove discontinued models with automatic disk cleanup of orphaned images.
* **Order Oversight:** View customer orders and transition fulfillment statuses (`pending` ➔ `confirmed`).

---

## 📡 Complete RESTful API Specification

### 1. Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | `{ name, email, password }` | Registers a new customer account, hashes password, returns JWT token |
| `POST` | `/api/auth/login` | Public | `{ email, password }` | Authenticates customer credentials and returns JWT bearer token |
| `POST` | `/api/auth/admin-login` | Public | `{ email, password }` | Authenticates dealership admin credentials and returns admin token |
| `GET` | `/api/auth/me` | Protected (User) | *None (Bearer Token)* | Validates active session and retrieves logged-in profile data |

### 2. Vehicle Management Endpoints (`/api/vehicles`)
| Method | Endpoint | Access | Request Parameters / Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/vehicles` | Public | Query: `?page=1&limit=12` | Lists all vehicles in inventory with pagination |
| `GET` | `/api/vehicles/search` | Public | Query: `?make=&model=&category=&minPrice=&maxPrice=&q=` | Searches fleet matching specific make, model, category, or price range |
| `GET` | `/api/vehicles/:id` | Public | URL Param: `id` | Fetches complete vehicle specification by MongoDB ObjectId |
| `POST` | `/api/vehicles` | Protected | Multipart/form-data: `{ make, model, price, quantity, category, image, ... }` | Adds a new vehicle to dealership inventory |
| `PUT` | `/api/vehicles/:id` | Protected | Form-data / JSON: updated vehicle fields | Updates vehicle details, price, or specifications |
| `DELETE` | `/api/vehicles/:id` | Protected (Admin) | URL Param: `id` | Permanently deletes a vehicle and cleans up image asset from disk |

### 3. Inventory Operations (`/api/vehicles/:id/*`)
| Method | Endpoint | Access | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/vehicles/:id/purchase` | Protected (User) | `{ quantity: 1 }` | Purchases vehicle units, atomically decrements inventory stock, sets `sold_out` if stock hits 0. Rejects if out of stock |
| `POST` | `/api/vehicles/:id/restock` | Protected (Admin) | `{ quantity: 5 }` | Restocks inventory units, increments vehicle stock count, restores `available` status |

### 4. Orders & Bookings (`/api/bookings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/bookings/my-purchases` | Protected (User) | Retrieves logged-in customer's order history and delivery records |
| `GET` | `/api/bookings` | Protected (Admin) | Admin list of all dealership customer orders with search and date filters |
| `PATCH` | `/api/bookings/:id/status` | Protected (Admin) | Updates order fulfillment status (`pending` ➔ `confirmed` ➔ `completed`) |

---

## 🧪 Test-Driven Development (TDD) & Test Suite

The backend was constructed adhering strictly to **Test-Driven Development (TDD)** using the **Red-Green-Refactor** cycle:

1. **🔴 Red Phase:** Unit tests were written before feature implementations. Tests asserted desired behavior (such as `400 Bad Request` when purchasing out-of-stock vehicles, or inventory stock decrementing after purchase), running in a failing state.
2. **🟢 Green Phase:** Minimal, clean controller logic was developed to satisfy the assertions and bring the test suite into a passing state.
3. **🔵 Refactor Phase:** Code was modularized (extracting auth middleware, validating numeric boundaries, normalizing vehicle pricing) while verifying tests remained green.

### Executing Automated Tests
From the `backend` directory:
```bash
cd backend
npm test
```

### 📊 Comprehensive Test Report (25 / 25 Passing)
> 📄 *A dedicated standalone report is available in [TEST_REPORT.md](TEST_REPORT.md).*

| # | Test Suite | Endpoint / Unit Tested | Assertion / Expected Behavior | Result |
|---|---|---|---|:---:|
| 1 | `vehicle.test.js` | `POST /api/vehicles` | Add new vehicle with unique ID, make, model, category, price, quantity | ✅ PASS |
| 2 | `vehicle.test.js` | `POST /api/vehicles` | Reject creation with 400 when make or model is missing | ✅ PASS |
| 3 | `vehicle.test.js` | `GET /api/vehicles` | Retrieve list of all vehicles with pagination metadata | ✅ PASS |
| 4 | `vehicle.test.js` | `GET /api/vehicles/:id` | Retrieve single vehicle specification by unique ObjectId | ✅ PASS |
| 5 | `vehicle.test.js` | `GET /api/vehicles/search` | Search inventory by make (case-insensitive substring match) | ✅ PASS |
| 6 | `vehicle.test.js` | `GET /api/vehicles/search` | Filter inventory by vehicle category / body style | ✅ PASS |
| 7 | `vehicle.test.js` | `GET /api/vehicles/search` | Filter vehicles within price range boundaries (`minPrice` & `maxPrice`) | ✅ PASS |
| 8 | `vehicle.test.js` | `PUT /api/vehicles/:id` | Update vehicle details and price specifications | ✅ PASS |
| 9 | `vehicle.test.js` | `POST /api/vehicles/:id/purchase` | Enforce authentication: Reject unauthenticated purchase attempts (401) | ✅ PASS |
| 10 | `vehicle.test.js` | `POST /api/vehicles/:id/purchase` | Decrement available stock quantity by requested units upon purchase | ✅ PASS |
| 11 | `vehicle.test.js` | `POST /api/vehicles/:id/purchase` | Reject purchase with 400 when requesting more than available stock | ✅ PASS |
| 12 | `vehicle.test.js` | `POST /api/vehicles/:id/purchase` | Reject purchase with 400 when vehicle is completely out of stock (`quantity === 0`) | ✅ PASS |
| 13 | `vehicle.test.js` | `POST /api/vehicles/:id/restock` | Reject restock from regular customer accounts without admin role (403) | ✅ PASS |
| 14 | `vehicle.test.js` | `POST /api/vehicles/:id/restock` | Increment stock quantity atomically when restocked by authorized Admin | ✅ PASS |
| 15 | `vehicle.test.js` | `DELETE /api/vehicles/:id` | Reject vehicle deletion without Admin credentials (403) | ✅ PASS |
| 16 | `vehicle.test.js` | `DELETE /api/vehicles/:id` | Delete vehicle successfully and clean up disk assets when Admin authorized | ✅ PASS |
| 17 | `auth.test.js` | `POST /api/auth/register` | Register new customer account, hash password via bcrypt, return JWT | ✅ PASS |
| 18 | `auth.test.js` | `POST /api/auth/register` | Reject registration with 400 if required fields are missing | ✅ PASS |
| 19 | `auth.test.js` | `POST /api/auth/register` | Reject registration with 400 on invalid email syntax | ✅ PASS |
| 20 | `auth.test.js` | `POST /api/auth/register` | Reject registration with 400 if password length < 8 characters | ✅ PASS |
| 21 | `auth.test.js` | `POST /api/auth/register` | Reject duplicate email registration with 400 conflict | ✅ PASS |
| 22 | `auth.test.js` | `POST /api/auth/login` | Authenticate valid user credentials and return signed JWT token | ✅ PASS |
| 23 | `auth.test.js` | `POST /api/auth/login` | Reject login with 401 Unauthorized upon incorrect password | ✅ PASS |
| 24 | `auth.test.js` | `POST /api/auth/admin-login` | Authenticate dealership administrator and issue privileged JWT | ✅ PASS |
| 25 | `auth.test.js` | `POST /api/auth/admin-login` | Reject invalid admin credentials with 401 Unauthorized | ✅ PASS |

```text
PASS tests/vehicle.test.js
  Vehicles & Inventory API (TDD Kata)
    1. Vehicle Creation & Retrieval
      ✓ POST /api/vehicles - should add a new vehicle with unique ID, make, model, category, price, quantity
      ✓ POST /api/vehicles - should reject vehicle creation if make or model is missing
      ✓ GET /api/vehicles - should retrieve list of all vehicles
      ✓ GET /api/vehicles/:id - should retrieve a single vehicle by ID
    2. Vehicle Search & Filter
      ✓ GET /api/vehicles/search - should search vehicles by make
      ✓ GET /api/vehicles/search - should search vehicles by category
      ✓ GET /api/vehicles/search - should filter vehicles by price range (minPrice, maxPrice)
    3. Vehicle Update & Delete
      ✓ PUT /api/vehicles/:id - should update vehicle details
    4. Inventory Management: Purchase & Restock
      ✓ POST /api/vehicles/:id/purchase - should require authentication
      ✓ POST /api/vehicles/:id/purchase - should decrease quantity by 1 when purchased
      ✓ POST /api/vehicles/:id/purchase - should fail when purchasing more than available stock
      ✓ POST /api/vehicles/:id/purchase - should fail when vehicle is out of stock (quantity is 0)
      ✓ POST /api/vehicles/:id/restock - should reject restock from non-admin users
      ✓ POST /api/vehicles/:id/restock - should increase quantity when restocked by Admin
    5. Vehicle Deletion (Admin Only)
      ✓ DELETE /api/vehicles/:id - should reject deletion without admin authorization
      ✓ DELETE /api/vehicles/:id - should delete vehicle successfully when authorized as Admin

PASS tests/auth.test.js
  User Authentication API (TDD Kata)
    POST /api/auth/register
      ✓ should register a new user successfully and return token
      ✓ should reject registration if required fields are missing
      ✓ should reject registration with invalid email format
      ✓ should reject registration if password is less than 8 characters
      ✓ should reject duplicate email registration
    POST /api/auth/login
      ✓ should log in an existing user and return a JWT token
      ✓ should reject login with wrong password
    POST /api/auth/admin-login
      ✓ should log in with valid admin credentials
      ✓ should reject invalid admin credentials

Test Suites: 2 passed, 2 total
Tests:       25 passed, 25 total
Snapshots:   0 total
Status:      ALL TESTS PASSING (100% SUCCESS)
```

---

## 🤖 My AI Usage

In accordance with the assessment guidelines, AI tools were utilized transparently throughout the project as intelligent pair-programming assistants.

### 1. AI Tools Leveraged
* **Google Antigravity (Advanced Agentic Coding Assistant)**
* **ChatGPT (OpenAI)**
* **Google Gemini**

### 2. How AI Was Used Across the Development Lifecycle
* **Agentic Pair-Programming & Refactoring (Google Antigravity):**
  * Functioned as the primary agentic pair-programmer for in-editor refactoring, codebase structure alignment, and full-stack debugging.
  * Diagnosed a critical socket exhaustion bottleneck (`connect EADDRINUSE 127.0.0.1:5000`) caused by an Axios client recreated during component render cycles, assisting in refactoring it to module scope with stable `useCallback` hook dependencies.
  * Guided the integration of the shared API configuration (`src/config/api.js`) to eliminate inconsistent hardcoded host addresses.
* **Architecture & Database Resilience (Google Gemini):**
  * Brainstormed the RESTful route structure to ensure strict adherence to the Incubyte Kata specifications (specifically separating `/api/vehicles/:id/purchase` and `/api/vehicles/:id/restock`).
  * Assisted in formulating a dual-tier database connection strategy in `db.js`: pairing public DNS servers (`1.1.1.1` / `8.8.8.8`) with a direct replica-set host fallback to bypass Windows SRV DNS query timeouts.
* **TDD Test Suite Drafting (ChatGPT):**
  * Drafted initial Jest and Supertest test scaffolds for the Red-Green-Refactor cycle, formulating edge-case boundary assertions (such as rejecting purchases when `quantity === 0`, or requesting more units than currently in stock).
  * Assisted in formulating realistic automotive valuation calculations to benchmark realistic Indian Rupee prices across different vehicle segments.

### 3. Reflection on AI Impact
AI functioned as a force multiplier rather than an autonomous generator:
* **Velocity:** Accelerated repetitive boilerplate generation (test assertions, schema definitions, and form layouts), saving significant initial scaffolding time.
* **Focus on Business Logic:** By automating structural boilerplate, more focus was dedicated to edge-case handling—such as atomic inventory decrement, out-of-stock UI states, token verification guards, and printable invoice rendering.
* **Critical Human Oversight:** Every code snippet proposed by AI was reviewed, tested, and manually adapted. Issues such as Windows DNS SRV timeouts and React render cycles required hands-on debugging, proving that AI is most effective when guided by strong engineering fundamentals and thorough testing.

---

## 💻 Step-by-Step Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.x or higher)
* [Git](https://git-scm.com/)
* A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (or local MongoDB)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Ayush546230/Incubyte_car_inventory_system.git
cd Incubyte_car_inventory_system
```

---

### Step 2: Backend Setup & Testing
1. Navigate to the `backend` folder and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create your environment configuration file:
   ```bash
   cp .env.example .env
   ```
   *(Fill in your `MONGO_URI` and `JWT_SECRET` in `.env`)*

3. **Run the Automated TDD Test Suite:**
   ```bash
   npm test
   ```
   *(Verifies all 25 unit and integration tests pass)*

4. Start the backend server:
   ```bash
   npm start
   ```
   Server will start on `http://localhost:5000`.

---

### Step 3: Frontend Setup
1. In a separate terminal, navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   ```text
   http://localhost:5173
   ```

---

## 🔐 Environment Variables

### Backend Configuration (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.pa3rzw8.mongodb.net/CarRental
JWT_SECRET=your_super_secure_jwt_secret_key_2026
STRIPE_SECRET_KEY=sk_test_your_optional_stripe_key
FRONTEND_URL=http://localhost:5173
```

---

## 📁 Project Directory Structure

```text
Incubyte_car_inventory_system/
├── backend/
│   ├── config/
│   │   └── db.js                 # Resilient MongoDB Atlas connection with replica-set fallback
│   ├── controllers/
│   │   ├── bookingController.js  # Order fulfillment & customer purchase records
│   │   ├── paymentController.js  # Payment verification logic
│   │   ├── userController.js     # User registration, login, and profile
│   │   └── vehicleController.js  # Vehicle CRUD, search filters, purchase, and restock
│   ├── middlewares/
│   │   ├── auth.js               # JWT verification & adminOnly access guards
│   │   └── uploads.js            # Multer disk storage for vehicle images
│   ├── models/
│   │   ├── bookingModal.js       # Purchase order schema with delivery address
│   │   ├── carModal.js           # Vehicle inventory schema (unique ID, stock quantity, price)
│   │   └── userModel.js          # Customer & Admin user schema
│   ├── routes/
│   │   ├── bookingRoutes.js      # Customer purchases & admin booking endpoints
│   │   ├── paymentRoutes.js      # Payment confirmation routes
│   │   ├── userRoutes.js         # /api/auth routes
│   │   └── vehicleRoutes.js      # /api/vehicles & /api/vehicles/:id/* routes
│   ├── tests/
│   │   ├── auth.test.js          # TDD tests for registration, login, and JWT validation
│   │   ├── setup.js              # Global test database setup & teardown
│   │   └── vehicle.test.js       # TDD tests for CRUD, search, purchase decrement, and restock
│   ├── uploads/                  # Physical disk storage for uploaded vehicle images
│   ├── .env.example              # Template environment configuration
│   ├── package.json              # Backend dependencies & Jest test runner config
│   └── server.js                 # Express server bootstrap & middleware pipeline
│
├── frontend/
│   ├── src/
│   │   ├── admin/
│   │   │   ├── AddCar.jsx        # Admin form for adding new vehicle inventory
│   │   │   ├── AdminLayout.jsx   # Admin dashboard shell & sidebar navigation
│   │   │   ├── AdminLogin.jsx    # Admin credential authentication
│   │   │   ├── Booking.jsx       # Order management & status fulfillment table
│   │   │   └── ManageCar.jsx     # Vehicle inventory table (live stock edit, price, delete)
│   │   ├── components/
│   │   │   ├── CarDetail.jsx     # Vehicle inspection, tech specs, and purchase modal
│   │   │   ├── Cars.jsx          # Showroom catalog with live search, filters, & stock badges
│   │   │   ├── Footer.jsx        # Dealership footer with branding and links
│   │   │   ├── HomeCars.jsx      # Featured fleet display on landing page
│   │   │   ├── Login.jsx         # Customer login form with 1-click demo fill
│   │   │   ├── MyBookings.jsx    # Order history portfolio & printable tax invoice
│   │   │   ├── Navbar.jsx        # Navigation bar with live authentication state
│   │   │   └── Signup.jsx        # Customer registration form
│   │   ├── config/
│   │   │   └── api.js            # Centralized API base URL & image path normalizer
│   │   ├── pages/
│   │   │   ├── CarDetailPage.jsx # Full-page vehicle inspection route
│   │   │   ├── CarsPage.jsx      # Fleet collection route
│   │   │   ├── Home.jsx          # Dealership landing hero page
│   │   │   ├── MyBooking.jsx     # Purchases route wrapper
│   │   │   └── VerifyPaymentPage.jsx # Payment confirmation & status redirection
│   │   ├── App.jsx               # React Router route definitions & auth guards
│   │   └── index.css             # Tailwind CSS 4 theme tokens
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite configuration with /api & /uploads reverse proxy
│
├── .gitignore                    # Comprehensive ignores for node_modules, .env, and dist
└── README.md                     # Comprehensive documentation & TDD Kata report
```

---

## 📄 License
This project is licensed under the **ISC License**.

---
Developed by **[Ayush Srivastava](https://github.com/Ayush546230)** for the **Incubyte TDD Kata Assessment**.
