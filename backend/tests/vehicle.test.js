import request from "supertest";
import app from "../server.js";
import { connectTestDB, closeTestDB } from "./setup.js";
import Car from "../models/carModal.js";

describe("Vehicles & Inventory API (TDD Kata)", () => {
  let adminToken = "";
  let userToken = "";
  let createdVehicleId = "";

  beforeAll(async () => {
    await connectTestDB();

    // Login as Admin to get adminToken
    const adminRes = await request(app)
      .post("/api/auth/admin-login")
      .send({ email: "admin@rydex.com", password: "admin123" });
    adminToken = adminRes.body.token;

    // Register & Login as regular user to get userToken
    const userEmail = `buyer_${Date.now()}@example.com`;
    const regRes = await request(app)
      .post("/api/auth/register")
      .send({ name: "Buyer User", email: userEmail, password: "Password@123" });
    userToken = regRes.body.token;
  });

  afterAll(async () => {
    if (createdVehicleId) {
      await Car.findByIdAndDelete(createdVehicleId);
    }
    await closeTestDB();
  });

  describe("1. Vehicle Creation & Retrieval", () => {
    it("POST /api/vehicles - should add a new vehicle with unique ID, make, model, category, price, quantity", async () => {
      const newVehicle = {
        make: "Tesla",
        model: "Model S Plaid",
        category: "Sports",
        price: 89990,
        quantity: 3,
        year: 2024,
        transmission: "Automatic",
        fuelType: "Electric",
        seats: 5,
        mileage: 10,
        description: "Ultra high performance electric sedan",
      };

      const res = await request(app)
        .post("/api/vehicles")
        .send(newVehicle);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.vehicle).toBeDefined();
      expect(res.body.vehicle.make).toBe("Tesla");
      expect(res.body.vehicle.model).toBe("Model S Plaid");
      expect(res.body.vehicle.category).toBe("Sports");
      expect(res.body.vehicle.price).toBe(89990);
      expect(res.body.vehicle.quantity).toBe(3);
      expect(res.body.vehicle.id).toBeDefined();

      createdVehicleId = res.body.vehicle.id;
    });

    it("POST /api/vehicles - should reject vehicle creation if make or model is missing", async () => {
      const res = await request(app)
        .post("/api/vehicles")
        .send({ category: "Sedan", price: 20000 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("GET /api/vehicles - should retrieve list of all vehicles", async () => {
      const res = await request(app).get("/api/vehicles");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const found = res.body.data.find((v) => v.id === createdVehicleId);
      expect(found).toBeDefined();
      expect(found.quantity).toBeDefined();
      expect(found.price).toBeDefined();
    });

    it("GET /api/vehicles/:id - should retrieve a single vehicle by ID", async () => {
      const res = await request(app).get(`/api/vehicles/${createdVehicleId}`);

      expect(res.status).toBe(200);
      expect(res.body.make).toBe("Tesla");
      expect(res.body.price).toBe(89990);
    });
  });

  describe("2. Vehicle Search & Filter", () => {
    it("GET /api/vehicles/search - should search vehicles by make", async () => {
      const res = await request(app)
        .get("/api/vehicles/search")
        .query({ make: "Tesla" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.some((v) => v.make.toLowerCase().includes("tesla"))).toBe(true);
    });

    it("GET /api/vehicles/search - should search vehicles by category", async () => {
      const res = await request(app)
        .get("/api/vehicles/search")
        .query({ category: "Sports" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every((v) => v.category.toLowerCase() === "sports")).toBe(true);
    });

    it("GET /api/vehicles/search - should filter vehicles by price range (minPrice, maxPrice)", async () => {
      const res = await request(app)
        .get("/api/vehicles/search")
        .query({ minPrice: 80000, maxPrice: 100000 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every((v) => v.price >= 80000 && v.price <= 100000)).toBe(true);
    });
  });

  describe("3. Vehicle Update & Delete", () => {
    it("PUT /api/vehicles/:id - should update vehicle details", async () => {
      const res = await request(app)
        .put(`/api/vehicles/${createdVehicleId}`)
        .send({ price: 84990, color: "Midnight Silver" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.vehicle.price).toBe(84990);
      expect(res.body.vehicle.color).toBe("Midnight Silver");
    });
  });

  describe("4. Inventory Management: Purchase & Restock", () => {
    it("POST /api/vehicles/:id/purchase - should require authentication", async () => {
      const res = await request(app)
        .post(`/api/vehicles/${createdVehicleId}/purchase`)
        .send({});

      expect(res.status).toBe(401);
    });

    it("POST /api/vehicles/:id/purchase - should decrease quantity by 1 when purchased", async () => {
      // Current quantity is 3
      const res = await request(app)
        .post(`/api/vehicles/${createdVehicleId}/purchase`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ quantity: 1 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.remainingStock).toBe(2);
      expect(res.body.vehicle.quantity).toBe(2);
    });

    it("POST /api/vehicles/:id/purchase - should fail when purchasing more than available stock", async () => {
      // Remaining stock is 2, requesting 5
      const res = await request(app)
        .post(`/api/vehicles/${createdVehicleId}/purchase`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("POST /api/vehicles/:id/purchase - should fail when vehicle is out of stock (quantity is 0)", async () => {
      // Set vehicle quantity to 0
      await Car.findByIdAndUpdate(createdVehicleId, { quantity: 0, status: "sold_out" });

      const res = await request(app)
        .post(`/api/vehicles/${createdVehicleId}/purchase`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ quantity: 1 });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/out of stock/i);
    });

    it("POST /api/vehicles/:id/restock - should reject restock from non-admin users", async () => {
      const res = await request(app)
        .post(`/api/vehicles/${createdVehicleId}/restock`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(403);
    });

    it("POST /api/vehicles/:id/restock - should increase quantity when restocked by Admin", async () => {
      // Restock 5 units
      const res = await request(app)
        .post(`/api/vehicles/${createdVehicleId}/restock`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.totalStock).toBe(5); // Was 0, now 5
      expect(res.body.vehicle.quantity).toBe(5);
    });
  });

  describe("5. Vehicle Deletion (Admin Only)", () => {
    it("DELETE /api/vehicles/:id - should reject deletion without admin authorization", async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${createdVehicleId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it("DELETE /api/vehicles/:id - should delete vehicle successfully when authorized as Admin", async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${createdVehicleId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion
      const checkRes = await request(app).get(`/api/vehicles/${createdVehicleId}`);
      expect(checkRes.status).toBe(404);
      createdVehicleId = null;
    });
  });
});
