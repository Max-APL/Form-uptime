import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import {
  initOraclePool,
  testOracleConnection,
  getEventPeriodStatus,
  getEventsByPeriod,
  insertEventsToOracle,
  syncPeriodEventsToOracle
} from './db.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distPath = path.resolve(__dirname, '../dist')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '20mb' }))

// Initialize Oracle Pool on startup
initOraclePool()

// Health & Status route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.0',
    service: 'BMSC Uptime Oracle API (V2 Ready)',
    timestamp: new Date().toISOString()
  })
})

// Database Connection Status route
app.get('/api/db-status', async (req, res) => {
  const result = await testOracleConnection()
  res.json(result)
})

// Check period status (whether records exist for year/month)
app.get('/api/events/status', async (req, res) => {
  const year = Number(req.query.year)
  const month = Number(req.query.month)

  if (!Number.isInteger(year) || year < 2000 || year > 2100 || !Number.isInteger(month) || month < 1 || month > 12) {
    return res.status(400).json({ message: 'El mes o año no es válido.' })
  }

  try {
    res.json(await getEventPeriodStatus(year, month))
  } catch (err) {
    console.error('Error consultando el período en Oracle:', err)
    res.status(503).json({ message: 'No se pudo consultar Oracle.' })
  }
})

// Query events handler (used by /api/events and /api/v2/events)
async function handleGetEvents(req, res) {
  const year = Number(req.query.year)
  const month = Number(req.query.month)

  if (!Number.isInteger(year) || year < 2000 || year > 2100 || !Number.isInteger(month) || month < 1 || month > 12) {
    return res.status(400).json({ success: false, message: 'El mes o año no es válido.' })
  }

  try {
    const events = await getEventsByPeriod(year, month)
    res.json({ success: true, events, total: events.length })
  } catch (err) {
    console.error('Error consultando eventos en Oracle:', err)
    res.status(503).json({
      success: false,
      message: 'No se pudieron consultar los registros de Oracle. Comprueba la conexión.',
      error: String(err)
    })
  }
}

app.get('/api/events', handleGetEvents)
app.get('/api/v2/events', handleGetEvents)

// Insert events handler (used by /api/events and /api/v2/events)
async function handlePostEvents(req, res) {
  try {
    const { events, year, month } = req.body
    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se enviaron eventos para guardar.'
      })
    }

    let result
    if (year && month) {
      result = await syncPeriodEventsToOracle(Number(year), Number(month), events)
    } else {
      result = await insertEventsToOracle(events)
    }

    res.json({
      success: true,
      message: `Se guardaron exitosamente ${result.insertedCount} registros en la base de datos Oracle.`,
      insertedCount: result.insertedCount
    })
  } catch (err) {
    console.error('Error guardando eventos en Oracle:', err)
    res.status(500).json({
      success: false,
      message: `Error al guardar en Oracle DB: ${err.message || err}`,
      error: String(err)
    })
  }
}

app.post('/api/events', handlePostEvents)
app.post('/api/v2/events', handlePostEvents)

// Serve static frontend in production if dist/ folder exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor API Oracle escuchando en http://localhost:${PORT}`)
})
