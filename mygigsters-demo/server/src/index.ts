import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { connectDB } from './config/db'
import workerRoutes from './routes/worker'
import adminRoutes from './routes/admin'

const app = express()
app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api/worker', workerRoutes)
app.use('/api/admin', adminRoutes)

const PORT = Number(process.env.PORT || 3000)

async function start() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing')
  await connectDB(process.env.MONGO_URI)
  app.listen(PORT, () => console.log(`[server] http://localhost:${PORT}`))
}
start()