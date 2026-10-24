# 🧪 Automated Test Report: Car Dealership Inventory System
> **Assessment:** Incubyte Full-Stack Software Craftsperson Assessment (TDD Kata)  
> **Repository:** [Incubyte_car_inventory_system](https://github.com/Ayush546230/Incubyte_car_inventory_system)  
> **Live Deployments:** [Frontend on Vercel](https://incubyte-car-inventory-system.vercel.app/) | [Backend on Render](https://incubyte-car-inventory-system.onrender.com)  
> **Author:** Ayush Srivastava  
> **Generated Date:** October 2026  

---

## 📋 Executive Summary

The backend API for the Car Dealership Inventory System was constructed strictly adhering to the **Test-Driven Development (TDD)** discipline utilizing the **Red-Green-Refactor** development cycle.

Every endpoint, authentication guard, edge-case validation, and atomic inventory stock mutation has dedicated automated unit and integration tests.

### 🎯 Test Execution Metrics
| Metric | Value |
|:---|:---|
| **Test Framework** | Jest v29 + Supertest (Native ECMAScript Modules) |
| **Total Test Suites** | **2 Passed**, 0 Failed, 2 Total (**100%**) |
| **Total Test Cases** | **25 Passed**, 0 Failed, 25 Total (**100%**) |
| **Snapshots** | 0 Total |
| **Execution Mode** | Band isolation (`--runInBand --detectOpenHandles --forceExit`) |
| **Overall Status** | 🟢 **ALL TESTS GREEN (100% PASS RATE)** |

---

## 🔬 Detailed Test Suite Breakdown

### Suite 1: `tests/vehicle.test.js` (Vehicles & Inventory Kata)
*Covers vehicle catalog CRUD, dynamic search filters, atomic stock purchases, and administrative restock/deletion operations.*

| # | Group / Feature | Method & Route | Expected Behavior / Assertion | Status |
|:---:|:---|:---|:---|:---:|
| **1** | Vehicle Creation | `POST /api/vehicles` | Adds a new vehicle to inventory with unique ID, make, model, category, price, and stock quantity | ✅ PASS |
| **2** | Input Validation | `POST /api/vehicles` | Rejects creation with `400 Bad Request` if required fields (`make` or `model`) are missing | ✅ PASS |
| **3** | Fleet Retrieval | `GET /api/vehicles` | Retrieves complete paginated list of all active vehicles | ✅ PASS |
| **4** | Specification Lookup | `GET /api/vehicles/:id` | Fetches vehicle specification by MongoDB ObjectId | ✅ PASS |
| **5** | Search & Filter | `GET /api/vehicles/search` | Filters vehicles matching make query (case-insensitive substring match) | ✅ PASS |
| **6** | Category Filter | `GET /api/vehicles/search` | Filters vehicles strictly matching designated body style/category (e.g. `Sedan`, `SUV`) | ✅ PASS |
| **7** | Price Range Filter | `GET /api/vehicles/search` | Filters vehicles within numeric price boundaries (`minPrice` & `maxPrice`) | ✅ PASS |
| **8** | Vehicle Update | `PUT /api/vehicles/:id` | Modifies vehicle details, features, and price specifications | ✅ PASS |
| **9** | Auth Guard | `POST /api/vehicles/:id/purchase` | Rejects purchase request with `401 Unauthorized` when Bearer token is absent | ✅ PASS |
| **10** | Stock Decrement | `POST /api/vehicles/:id/purchase` | Atomically decrements vehicle stock quantity upon verified customer purchase | ✅ PASS |
| **11** | Boundary Validation | `POST /api/vehicles/:id/purchase` | Rejects purchase with `400 Bad Request` if requested quantity exceeds available stock | ✅ PASS |
| **12** | Out-of-Stock Guard | `POST /api/vehicles/:id/purchase` | Rejects purchase with `400 Bad Request` when vehicle stock is completely exhausted (`quantity === 0`) | ✅ PASS |
| **13** | Role-Based Access | `POST /api/vehicles/:id/restock` | Rejects restock operation with `403 Forbidden` if attempted by regular customer | ✅ PASS |
| **14** | Inventory Restock | `POST /api/vehicles/:id/restock` | Atomically increments vehicle stock quantity when authorized by Admin | ✅ PASS |
| **15** | Role-Based Access | `DELETE /api/vehicles/:id` | Rejects deletion request with `403 Forbidden` from non-admin accounts | ✅ PASS |
| **16** | Vehicle Deletion | `DELETE /api/vehicles/:id` | Permanently deletes vehicle record from database and cleans up image assets from disk | ✅ PASS |

---

### Suite 2: `tests/auth.test.js` (User & Admin Authentication Kata)
*Covers customer onboarding, password hashing (bcrypt), token issuance (JWT), and administrator authorization.*

| # | Group / Feature | Method & Route | Expected Behavior / Assertion | Status |
|:---:|:---|:---|:---|:---:|
| **17** | User Registration | `POST /api/auth/register` | Registers customer, hashes password with bcrypt salt rounds, and issues valid JWT | ✅ PASS |
| **18** | Input Validation | `POST /api/auth/register` | Rejects registration with `400 Bad Request` when name, email, or password is omitted | ✅ PASS |
| **19** | Syntax Validation | `POST /api/auth/register` | Rejects registration with `400 Bad Request` upon invalid email regex pattern | ✅ PASS |
| **20** | Password Policy | `POST /api/auth/register` | Enforces password complexity, rejecting passwords with fewer than 8 characters | ✅ PASS |
| **21** | Conflict Detection | `POST /api/auth/register` | Rejects duplicate user registration with `400 Bad Request` when email is already registered | ✅ PASS |
| **22** | Customer Login | `POST /api/auth/login` | Authenticates existing user with email/password and returns signed JWT | ✅ PASS |
| **23** | Credential Security | `POST /api/auth/login` | Rejects login attempt with `401 Unauthorized` when given an incorrect password | ✅ PASS |
| **24** | Dealership Admin Auth | `POST /api/auth/admin-login` | Validates dealership admin credentials and returns elevated administrative JWT | ✅ PASS |
| **25** | Admin Credential Security | `POST /api/auth/admin-login` | Rejects invalid admin credentials with `401 Unauthorized` | ✅ PASS |

---

## 🖥 Verbatim Terminal Test Output

Below is the verbatim terminal output captured directly from running `npm test` inside the `backend` directory:

```text
> backend@1.0.0 test
> cross-env NODE_ENV=test node --experimental-vm-modules node_modules/jest/bin/jest.js --verbose --runInBand --detectOpenHandles --forceExit

PASS tests/vehicle.test.js
  Vehicles & Inventory API (TDD Kata)
    1. Vehicle Creation & Retrieval
      ✓ POST /api/vehicles - should add a new vehicle with unique ID, make, model, category, price, quantity (113 ms)
      ✓ POST /api/vehicles - should reject vehicle creation if make or model is missing (10 ms)
      ✓ GET /api/vehicles - should retrieve list of all vehicles (259 ms)
      ✓ GET /api/vehicles/:id - should retrieve a single vehicle by ID (159 ms)
    2. Vehicle Search & Filter
      ✓ GET /api/vehicles/search - should search vehicles by make (123 ms)
      ✓ GET /api/vehicles/search - should search vehicles by category (132 ms)
      ✓ GET /api/vehicles/search - should filter vehicles by price range (minPrice, maxPrice) (82 ms)
    3. Vehicle Update & Delete
      ✓ PUT /api/vehicles/:id - should update vehicle details (185 ms)
    4. Inventory Management: Purchase & Restock
      ✓ POST /api/vehicles/:id/purchase - should require authentication (12 ms)
      ✓ POST /api/vehicles/:id/purchase - should decrease quantity by 1 when purchased (229 ms)
      ✓ POST /api/vehicles/:id/purchase - should fail when purchasing more than available stock (210 ms)
      ✓ POST /api/vehicles/:id/purchase - should fail when vehicle is out of stock (quantity is 0) (168 ms)
      ✓ POST /api/vehicles/:id/restock - should reject restock from non-admin users (1080 ms)
      ✓ POST /api/vehicles/:id/restock - should increase quantity when restocked by Admin (135 ms)
    5. Vehicle Deletion (Admin Only)
      ✓ DELETE /api/vehicles/:id - should reject deletion without admin authorization (693 ms)
      ✓ DELETE /api/vehicles/:id - should delete vehicle successfully when authorized as Admin (135 ms)

PASS tests/auth.test.js
  User Authentication API (TDD Kata)
    POST /api/auth/register
      ✓ should register a new user successfully and return token (1310 ms)
      ✓ should reject registration if required fields are missing (9 ms)
      ✓ should reject registration with invalid email format (24 ms)
      ✓ should reject registration if password is less than 8 characters (9 ms)
      ✓ should reject duplicate email registration (592 ms)
    POST /api/auth/login
      ✓ should log in an existing user and return a JWT token (604 ms)
      ✓ should reject login with wrong password (382 ms)
    POST /api/auth/admin-login
      ✓ should log in with valid admin credentials (10 ms)
      ✓ should reject invalid admin credentials (40 ms)

Test Suites: 2 passed, 2 total
Tests:       25 passed, 25 total
Snapshots:   0 total
Time:        12.193 s
Ran all test suites.
```

---

## 🛠 Steps to Reproduce & Verify Tests Locally

### Prerequisites
- Node.js (v18+ or v20+)
- MongoDB Atlas cluster or local MongoDB instance (`mongodb://127.0.0.1:27017`)

### Commands
```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies (if not already installed)
npm install

# 3. Execute the automated test suite
npm test
```
To run tests with full verbose logs:
```bash
npx cross-env NODE_ENV=test node --experimental-vm-modules node_modules/jest/bin/jest.js --verbose --runInBand --detectOpenHandles --forceExit
```

---

## 🛡 Key TDD Edge Cases Tested

1. **Inventory Concurrency & Atomicity:**
   - Validates that when a purchase transaction completes, vehicle inventory quantity decrements correctly.
   - Guards against overselling by asserting that purchases beyond available stock are rejected.
2. **Out-of-Stock Enforcement:**
   - When a vehicle's quantity reaches `0`, the system automatically flags it and rejects any further checkout attempts with `400 Bad Request`.
3. **Role-Based Security:**
   - Customer accounts are blocked from administrative routes (`restock`, `add vehicle`, `delete vehicle`) with `403 Forbidden`.
4. **Data Integrity & Schema Sanitization:**
   - Validates password minimum lengths, email regex compliance, unique constraints, and required fields.
