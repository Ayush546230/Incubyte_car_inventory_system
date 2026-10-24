import mongoose from "mongoose";
const { Schema } = mongoose;

const carSchema = new Schema({
  make: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  year: { type: Number, required: true },
  color: { type: String, default: "" },
  category: { type: String, default: "Sedan" },
  seats: { type: Number, default: 4 },
  transmission: { type: String, default: "Automatic" },
  fuelType: { type: String, default: "Gasoline" },
  mileage: { type: Number, default: 0 },
  dailyRate: { type: Number, default: 50 },
  price: { type: Number, default: 25000 },
  quantity: { type: Number, default: 5, min: 0 },
  status: {
    type: String,
    enum: ["available", "rented", "maintenance", "sold_out"],
    default: "available",
  },
  image: { type: String, default: "" },
  description: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  bookings: { type: Array, default: [] },
});

const Car = mongoose.models.Car || mongoose.model("Car", carSchema);
export default Car;