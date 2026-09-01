import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import {
  initOraclePool,
  testOracleConnection,
  getEventPeriodStatus,
  getEventsByPeriod,
  insertEventsToOracle
} from './db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '15mb' }))

// Initialize Oracle Pool on startup
initOraclePool()

// Health & Status route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BMSC Uptime Oracle API',
    timestamp: new Date().toISOString()
  })
})

// Database Connection Status route
app.get('/api/db-status', async (req, res) => {
  const result = await testOracleConnection()
  res.json(result)
})

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

app.get('/api/events', async (req, res) => {
  const year = Number(req.query.year)
  const month = Number(req.query.month)

  if (!Number.isInteger(year) || year < 2000 || year > 2100 || !Number.isInteger(month) || month < 1 || month > 12) {
    return res.status(400).json({ message: 'El mes o año no es válido.' })
  }

  try {
    const events = await getEventsByPeriod(year, month)
    res.json({ events, total: events.length })
  } catch (err) {
    console.error('Error consultando eventos en Oracle:', err)
    res.status(503).json({ message: 'No se pudieron consultar los registros de Oracle.' })
  }
})

// Insert / Sync Events to Oracle Database (EVENTOS_DOWNTIME)
app.post('/api/events', async (req, res) => {
  try {
    const { events } = req.body
    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se enviaron eventos para guardar.'
      })
    }

    const result = await insertEventsToOracle(events)
    res.json({
      success: true,
      message: `Se insertaron ${result.insertedCount} registros en la tabla EVENTOS_DOWNTIME exitosamente.`,
      insertedCount: result.insertedCount
    })
  } catch (err) {
    console.error('Error insertando eventos en Oracle:', err)
    res.status(500).json({
      success: false,
      message: `Error al insertar en Oracle DB: ${err.message || err}`,
      error: String(err)
    })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor API Oracle escuchando en http://localhost:${PORT}`)
})
