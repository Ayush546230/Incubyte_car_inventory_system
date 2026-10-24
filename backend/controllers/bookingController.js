import Booking from "../models/bookingModal.js";

/**
 * Retrieves all vehicle purchase orders for the admin management view.
 * 
 * Supports:
 * - Pagination with page number and items limit
 * - Text search across customer name, email, car make, or model
 * - Status filtering (e.g. pending, confirmed, completed)
 * - Order date range filtering (from / to timestamps)
 * - Sorts newest orders first so the latest transactions appear at the top
 */
export const getBookings = async (req, res, next) => {
  try {
    // Read pagination parameters from query string (defaults to page 1, max 100 items)
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 12, 100);

    // Read search keywords and filter criteria
    const search = req.query.search?.trim() || "";
    const status = req.query.status?.trim() || "";
    const carFilter = req.query.car?.trim() || "";
    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;

    // Start with an empty query object
    const query = {};

    // 1. Text Search: If user typed in search bar, match across customer name, email, car make, or model
    if (search) {
      const q = { $regex: search, $options: "i" };
      query.$or = [
        { customer: q },
        { email: q },
        { "car.make": q },
        { "car.model": q },
      ];
    }

    // 2. Status Filter: Match specific order status (e.g. 'pending', 'confirmed')
    if (status) query.status = status;

    // 3. Vehicle Filter: Match either by MongoDB car ID or vehicle make/model name
    if (carFilter) {
      if (/^[0-9a-fA-F]{24}$/.test(carFilter)) query["car.id"] = carFilter;
      else
        query.$or = [
          ...(query.$or || []),
          { "car.make": { $regex: carFilter, $options: "i" } },
          { "car.model": { $regex: carFilter, $options: "i" } },
        ];
    }

    // 4. Date Range Filter: Filter orders placed between 'from' and 'to' timestamps
    if (from || to) {
      const dateRange = {};
      if (from) dateRange.$gte = from;
      if (to) dateRange.$lte = to;
      query.$or = [
        ...(query.$or || []),
        { createdAt: dateRange },
        { bookingDate: dateRange },
      ];
    }

    // Count matching documents to calculate total page count for pagination controls
    const total = await Booking.countDocuments(query);

    // Fetch the specific page slice, sorted newest-first
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1, bookingDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Send paginated response back to admin dashboard
    res.json({
      page,
      pages: Math.ceil(total / limit),
      total,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves the purchase history for the currently authenticated customer.
 * Uses the user ID or email attached to req.user by authMiddleware.
 */
export const getMyBookings = async (req, res, next) => {
  try {
    // Guard: Ensure user was authenticated by authMiddleware
    if (!req.user || (!req.user.id && !req.user._id))
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const userId = req.user._id || req.user.id;
    const userEmail = req.user.email;

    // Build query checking both user ObjectId and email
    // This ensures no past orders are missed regardless of which identifier was stored
    const query = {
      $or: [
        { userId: userId },
        { userId: String(userId) },
        ...(userEmail ? [{ email: { $regex: new RegExp(`^${userEmail.trim()}$`, "i") } }] : []),
      ],
    };

    // Fetch matching purchase orders, sorted newest first
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1, bookingDate: -1 })
      .lean();

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

/**
 * Updates the fulfillment status of an order.
 * Used by admins in the dashboard dropdown (e.g. moving an order from pending to confirmed).
 */
export const updatedBookingStatus = async (req, res, next) => {
  try {
    // Validate that a new status string was supplied
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status is required" });

    // Look up the order in MongoDB by its ID parameter
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Apply the new status and save changes
    booking.status = status;
    const updated = await booking.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
