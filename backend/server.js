import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import userRouter from './routes/userRoutes.js'
import path from 'path'
import helmet from 'helmet'
import { fileURLToPath } from 'url'
import vehicleRouter from './routes/vehicleRoutes.js'
import bookingRouter from './routes/bookingRoutes.js'
import paymentRouter from './routes/paymentRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== 'test') {
  // Connect to MongoDB Atlas via Cloudflare DNS resolver
  connectDB();
}

// Middlewares
app.use(cors())
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  '/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    next();
  },
  express.static(path.join(__dirname, 'uploads'))
)

// Routes
app.use('/api/auth', userRouter)
app.use('/api/vehicles', vehicleRouter)
app.use('/api/cars', vehicleRouter) // Backward compatible with /api/cars
app.use('/api/bookings', bookingRouter)
app.use('/api/payments', paymentRouter)

app.get('/api/ping', (req, res) => res.json({
  ok: true,
  time: Date.now()
}))

app.get('/', (req, res) => {
  res.send('RYDEX Dealership API WORKING')
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://127.0.0.1:${PORT} and http://localhost:${PORT} [Dealership System Ready]`)
  })
}

export default app;