import mongoose from "mongoose";
import Car from "./carModal.js";

const { Schema } = mongoose;
const addressSchema = new Schema(
  { street: String, city: String, state: String, zipCode: String },
  { _id: false, default: {} }
);

const carSummarySchema = new Schema(
  {
    id: { type: Schema.Types.Mixed, required: false },
    make: { type: String, default: "" },
    model: { type: String, default: "" },
    name: { type: String, default: "" },
    price: { type: Number, default: 0 },
    year: Number,
    dailyRate: { type: Number, default: 0 },
    category: { type: String, default: "Sedan" },
    seats: { type: Number, default: 4 },
    transmission: { type: String, default: "" },
    fuelType: { type: String, default: "" },
    mileage: { type: Number, default: 0 },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const bookingSchema = new Schema(
  {
    userId: { type: Schema.Types.Mixed, required: false },
    customer: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    car: { type: carSummarySchema, required: true },
    carImage: { type: String, default: "" },
    quantity: { type: Number, default: 1, min: 1 },
    orderType: { type: String, default: "purchase" },
    pickupDate: { type: Date, default: Date.now },
    returnDate: { type: Date, default: Date.now },
    bookingDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled", "upcoming", "confirmed"],
      default: "pending",
    },
    amount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Credit Card", "Paypal"],
      default: "Credit Card",
    },
    sessionId: String,
    paymentIntentId: String,
    address: { type: addressSchema, default: () => ({}) },
    stripeSession: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

/**
 * Checks if a given string matches MongoDB's 24-character hexadecimal ObjectId pattern.
 */
const isValidHexId = (val) => val && /^[0-9a-fA-F]{24}$/.test(String(val));

/**
 * Pre-validation hook:
 * If a booking or order is created with only a vehicle ID and missing car snapshot fields,
 * this hook automatically looks up the vehicle in the database and embeds its details
 * (make, model, specs, image) into the booking document.
 * This guarantees the customer's purchase record preserves exact vehicle specifications
 * even if the car's catalog listing is later modified or removed.
 */
bookingSchema.pre("validate", async function (next) {
  if (!this.car?.id || !isValidHexId(this.car.id)) return next();

  const { make, model, dailyRate } = this.car;
  if (make || model || dailyRate) return next();

  try {
    const carDoc = await Car.findById(this.car.id).lean();
    if (carDoc) {
      Object.assign(this.car, {
        make: carDoc.make ?? this.car.make,
        model: carDoc.model ?? this.car.model,
        year: carDoc.year ?? this.car.year,
        dailyRate: carDoc.dailyRate ?? this.car.dailyRate,
        seats: carDoc.seats ?? this.car.seats,
        transmission: carDoc.transmission ?? this.car.transmission,
        fuelType: carDoc.fuelType ?? this.car.fuelType,
        mileage: carDoc.mileage ?? this.car.mileage,
        image: carDoc.image ?? this.car.image,
      });
      if (!this.carImage) this.carImage = carDoc.image || "";
    }
    next();
  } catch (err) {
    next(err);
  }
});




export default mongoose.models.Booking || mongoose.model('Booking',bookingSchema);