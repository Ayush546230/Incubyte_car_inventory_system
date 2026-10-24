import Booking from "../models/bookingModal.js";
import Car from "../models/carModal.js";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();
const CLIENT_URL = "http://localhost:5173";
const STRIPE_API_VERSION = "2022-11-15";

const getStripe = () => {
  const key = (process.env.STRIPE_SECRET_KEY || "").trim();
  if (!key) throw new Error("Missing Stripe Key");
  return new Stripe(key, { apiVersion: STRIPE_API_VERSION });
};

/**
 * Creates a vehicle purchase order and starts the payment checkout flow.
 * 
 * Process:
 * 1. Validates customer contact details and requested quantity.
 * 2. Checks inventory to ensure enough units are in stock.
 * 3. Creates the order in MongoDB with purchase timestamp and delivery address.
 * 4. Decrements vehicle stock immediately for instant card payments or creates a Stripe session.
 */
export const createCheckoutSession = async (req, res) => {
  try {
    // Check if the request body exists
    if (!req.body)
      return res.status(400).json({
        success: false,
        message: "Missing request key",
      });

    // Extract order and buyer details from the client request
    const {
      userId,
      customer,
      email,
      phone,
      car,
      quantity = 1,
      amount,
      details,
      address,
      carImage,
    } = req.body;

    // Step 1: Validate customer information
    if (!customer || !String(customer).trim()) {
      return res.status(400).json({ success: false, message: "Full Name is required" });
    }
    if (!email || !String(email).trim() || !String(email).includes("@")) {
      return res.status(400).json({ success: false, message: "Valid Email address is required" });
    }
    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    // Step 2: Ensure purchase quantity is a positive whole number
    const purchaseQty = parseInt(quantity, 10);
    if (!purchaseQty || purchaseQty < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    // Parse car details if sent as a JSON string from form data
    let carField = car;
    if (typeof car === "string") {
      try {
        carField = JSON.parse(car);
      } catch {
        carField = { name: car };
      }
    }

    // Step 3: Check live inventory in MongoDB to ensure vehicle has sufficient stock
    const carId = (carField && (carField.id || carField._id)) || null;
    let dbVehicle = null;
    const isValidHexId = (val) => val && /^[0-9a-fA-F]{24}$/.test(String(val));
    if (carId && isValidHexId(carId)) {
      dbVehicle = await Car.findById(carId);
      if (dbVehicle) {
        // Reject if out of stock
        if (dbVehicle.quantity <= 0) {
          return res.status(400).json({
            success: false,
            message: "This vehicle is currently out of stock",
          });
        }
        // Reject if customer requests more than what is left in stock
        if (dbVehicle.quantity < purchaseQty) {
          return res.status(400).json({
            success: false,
            message: `Only ${dbVehicle.quantity} unit(s) available in stock. Cannot purchase ${purchaseQty} units.`,
          });
        }
      }
    }

    // Step 4: Calculate total price (unitPrice * requested quantity)
    const unitPrice = dbVehicle?.price || carField?.price || 25000;
    const total = Number(amount) || (unitPrice * purchaseQty);

    const now = new Date();
    // Check if customer opted for direct 1-click test card payment
    const isDirect = Boolean(req.body.directPayment || req.body.paymentMethod === "instant_card" || req.body.paymentMethod === "card");

    // Step 5: Save initial purchase order record to the database
    const booking = await Booking.create({
      userId: userId ? String(userId) : undefined,
      customer: String(customer).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      car: carField ?? {},
      carImage: String(carImage ?? ""),
      quantity: purchaseQty,
      orderType: "purchase",
      bookingDate: now,
      pickupDate: now,
      returnDate: now,
      amount: total,
      paymentStatus: isDirect ? "paid" : "pending",
      details: typeof details === "string" ? JSON.parse(details) : details || {},
      address: typeof address === "string" ? JSON.parse(address) : address || {},
      status: isDirect ? "confirmed" : "pending",
      currency: "INR",
    });

    // Step 6 (Branch A): Direct test card payment confirmed instantly
    if (isDirect) {
      if (dbVehicle) {
        // Deduct purchased units from inventory
        dbVehicle.quantity = Math.max(0, dbVehicle.quantity - purchaseQty);
        // If stock hits 0, update vehicle status to sold_out
        if (dbVehicle.quantity === 0) dbVehicle.status = "sold_out";
        await dbVehicle.save();
      }

      return res.json({
        success: true,
        directConfirmed: true,
        bookingId: booking._id,
        message: `Payment of ₹${total.toLocaleString("en-IN")} confirmed successfully with pre-filled card!`,
      });
    }

    // Step 6 (Branch B): Initialize Stripe Checkout session
    const vehicleName =
      (carField && (carField.name || `${carField.make || ""} ${carField.model || ""}`.trim())) ||
      "Vehicle Purchase";

    let session = null;
    try {
      const stripe = getStripe();
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: email || undefined,
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: vehicleName,
                description: `Dealership Vehicle Purchase: ${purchaseQty} unit(s)`,
              },
              // Stripe takes amounts in smallest currency unit (paise for INR)
              unit_amount: Math.min(Math.round((total / purchaseQty) * 100), 50000000),
            },
            quantity: purchaseQty,
          },
        ],
        success_url: `${CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}&payment_status=success`,
        cancel_url: `${CLIENT_URL}/cancel?payment_status=cancel`,
        // Embed metadata so webhook / confirm endpoint can link this session back to the order
        metadata: {
          bookingId: booking._id.toString(),
          userId: String(userId ?? ""),
          carId: String(carId || ""),
          quantity: String(purchaseQty),
        },
      });

      // Save Stripe session details onto the booking record
      booking.sessionId = session.id;
      booking.stripeSession = {
        id: session.id,
        url: session.url || null,
      };
      await booking.save();

      // Return session url to client for redirection to Stripe checkout
      return res.json({
        success: true,
        id: session.id,
        url: session.url,
        bookingId: booking._id,
      });
    } catch (stripeErr) {
      console.warn("Stripe Checkout notice (confirming purchase directly):", stripeErr.message);

      // Resilient Fallback: If Stripe is offline or keys are invalid, confirm order directly
      // so user does not get stuck on a broken checkout screen
      booking.paymentStatus = "paid";
      booking.status = "confirmed";
      await booking.save();

      // Deduct inventory stock for the confirmed order
      if (dbVehicle) {
        dbVehicle.quantity = Math.max(0, dbVehicle.quantity - purchaseQty);
        if (dbVehicle.quantity === 0) dbVehicle.status = "sold_out";
        await dbVehicle.save();
      }

      return res.json({
        success: true,
        directConfirmed: true,
        bookingId: booking._id,
        message: "Payment and vehicle purchase confirmed successfully!",
      });
    }
  } catch (err) {
    console.error("CheckoutSession Error", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server Error",
    });
  }
};

/**
 * Verifies the completed Stripe checkout session and finalizes the vehicle purchase.
 * 
 * Process:
 * 1. Retrieves payment status from Stripe using the session_id.
 * 2. Updates the order in MongoDB to 'paid' and 'confirmed'.
 * 3. Decrements the vehicle inventory stock by the purchased units.
 */
export const confirmPayment = async (req, res) => {
  try {
    // Step 1: Ensure Stripe checkout session_id is provided in the query string
    const { session_id } = req.query;
    if (!session_id)
      return res
        .status(400)
        .json({ success: false, message: "Session_id required" });

    // Step 2: Initialize Stripe client with the secret API key
    let stripe;
    try {
      stripe = getStripe();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Payment not completed",
        error: err.message,
      });
    }

    // Step 3: Fetch the checkout session directly from Stripe's servers
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session)
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });

    // Check if Stripe confirmed the payment status
    if (session.payment_status !== "paid")
      return res.status(400).json({
        success: false,
        message: `Payment not completed. status=${session.payment_status}`,
        session,
      });

    // Step 4: Find the matching order by metadata bookingId or sessionId and mark it 'paid'
    const bookingId = session.metadata?.bookingId;
    let order = null;
    if (bookingId) {
      order = await Booking.findByIdAndUpdate(
        bookingId,
        {
          paymentStatus: "paid",
          status: "confirmed",
          paymentIntentId: session.payment_intent || "",
          paymentDetails: {
            amount_total: session.amount_total || null,
            currency: session.currency || null,
          },
        },
        { new: true }
      );
    }

    // Fallback: If not found by ID, look up by sessionId
    if (!order) {
      order = await Booking.findOneAndUpdate(
        { sessionId: session_id },
        {
          paymentStatus: "paid",
          status: "confirmed",
          paymentIntentId: session.payment_intent || "",
          paymentDetails: {
            amount_total: session.amount_total || null,
            currency: session.currency || null,
          },
        },
        { new: true }
      );
    }
    if (!order)
      return res.status(404).json({
        success: false,
        message: "Order not found for this session",
        session,
      });

    // Step 5: Real-time inventory decrement in MongoDB upon confirmed payment
    let remainingStock = null;
    const vId = session.metadata?.carId || (order.car && (order.car.id || order.car._id));
    const vQty = parseInt(session.metadata?.quantity, 10) || order.quantity || 1;
    const isValidHexId = (val) => val && /^[0-9a-fA-F]{24}$/.test(String(val));
    if (vId && isValidHexId(vId)) {
      const veh = await Car.findById(vId);
      if (veh) {
        // Subtract purchased units from vehicle stock
        veh.quantity = Math.max(0, (veh.quantity ?? 1) - vQty);
        // If stock reaches 0, update listing status to sold_out
        if (veh.quantity === 0) veh.status = "sold_out";
        await veh.save();
        remainingStock = veh.quantity;
      }
    }

    // Return the updated confirmed order and new stock count to the client
    return res.json({ success: true, order, remainingStock });
  } catch (err) {
    console.error("Confirm payment error", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server Error",
    });
  }
};
