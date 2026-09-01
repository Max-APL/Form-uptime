import oracledb from 'oracledb'
import dotenv from 'dotenv'

dotenv.config()

const dbConfig = {
  user: process.env.ORACLE_USER || 'SYSTEM',
  password: process.env.ORACLE_PASSWORD || 'oracle',
  connectString: process.env.ORACLE_CONNECT_STRING || '127.0.0.1:1521/XEPDB1'
}

let isPoolInitialized = false

/**
 * Initializes the Oracle connection pool in Thin mode.
 */
export async function initOraclePool() {
  if (isPoolInitialized) return

  try {
    // oracledb defaults to Thin mode in v6+
    await oracledb.createPool({
      ...dbConfig,
      poolMin: 1,
      poolMax: 5,
      poolIncrement: 1,
      poolTimeout: 60
    })
    isPoolInitialized = true
    console.log('✅ Pool de conexiones Oracle inicializado exitosamente en modo Thin.')
  } catch (err) {
    console.warn('⚠️ No se pudo inicializar el pool de Oracle (¿Base de datos apagada o credenciales pendientes?):', err.message)
  }
}

/**
 * Tests connection to the Oracle database.
 */
export async function testOracleConnection() {
  let connection
  try {
    connection = await oracledb.getConnection(dbConfig)
    const result = await connection.execute('SELECT 1 FROM DUAL')
    return {
      connected: true,
      message: 'Conectado a Oracle Database exitosamente',
      user: dbConfig.user,
      connectString: dbConfig.connectString
    }
  } catch (err) {
    return {
      connected: false,
      message: err.message,
      user: dbConfig.user,
      connectString: dbConfig.connectString
    }
  } finally {
    if (connection) {
      try {
        await connection.close()
      } catch (closeErr) {
        console.error('Error cerrando conexión de prueba:', closeErr)
      }
    }
  }
}

/**
 * Returns how many events have already been stored for a calendar period.
 */
export async function getEventPeriodStatus(year, month) {
  let connection
  try {
    connection = await oracledb.getConnection(dbConfig)
    const result = await connection.execute(
      `SELECT COUNT(*) AS TOTAL
         FROM EVENTOS_DOWNTIME
        WHERE FINI_CAIDA >= :periodStart
          AND FINI_CAIDA < :periodEnd`,
      {
        periodStart: new Date(year, month - 1, 1),
        periodEnd: new Date(year, month, 1)
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    )

    const total = Number(result.rows?.[0]?.TOTAL || 0)
    return { loaded: total > 0, total }
  } finally {
    if (connection) await connection.close()
  }
}

/**
 * Returns the events stored for a calendar period, ordered chronologically.
 */
export async function getEventsByPeriod(year, month) {
  let connection
  try {
    connection = await oracledb.getConnection(dbConfig)
    const result = await connection.execute(
      `SELECT SISTEMA,
              FINI_CAIDA,
              FFIN_CAIDA,
              INDICADOR,
              MOTIVO,
              ROUND((CAST(FFIN_CAIDA AS DATE) - CAST(FINI_CAIDA AS DATE)) * 24 * 60, 2) AS DURACION_MINUTOS
         FROM EVENTOS_DOWNTIME
        WHERE FINI_CAIDA >= :periodStart
          AND FINI_CAIDA < :periodEnd
        ORDER BY FINI_CAIDA, SISTEMA`,
      {
        periodStart: new Date(year, month - 1, 1),
        periodEnd: new Date(year, month, 1)
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    )

    return (result.rows || []).map((row, index) => ({
      id: `${year}-${month}-${index}`,
      sistema: row.SISTEMA,
      inicio: row.FINI_CAIDA,
      fin: row.FFIN_CAIDA,
      indicador: row.INDICADOR,
      motivo: row.MOTIVO,
      duracionMinutos: Number(row.DURACION_MINUTOS || 0)
    }))
  } finally {
    if (connection) await connection.close()
  }
}

/**
 * Parses raw date string and time string into a valid JavaScript Date object for Oracle TIMESTAMP.
 */
function parseDateTimeToDate(dateStr, timeStr) {
  try {
    const now = new Date()
    let year = now.getFullYear()
    let month = now.getMonth() // 0-11
    let day = now.getDate()

    const dStr = String(dateStr || '').toLowerCase().trim()
    const tStr = String(timeStr || '').toLowerCase().trim()

    // Match Spanish month names
    const monthsMap = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    }

    for (const [mName, mIdx] of Object.entries(monthsMap)) {
      if (dStr.includes(mName)) {
        month = mIdx
        const dayMatch = dStr.match(/(\d{1,2})\s+de\s+[a-z]+/i) || dStr.match(/(\d{1,2})/)
        if (dayMatch) day = parseInt(dayMatch[1], 10)

        const yearMatch = dStr.match(/\b(20\d\d)\b/)
        if (yearMatch) year = parseInt(yearMatch[1], 10)
        break
      }
    }

    // Match DD/MM/YYYY or YYYY-MM-DD
    const dmyMatch = dStr.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/)
    if (dmyMatch) {
      day = parseInt(dmyMatch[1], 10)
      month = parseInt(dmyMatch[2], 10) - 1
      year = parseInt(dmyMatch[3], 10)
    }

    // Parse time
    const isPM = /p\.?\s*m\.?/i.test(tStr) || /pm/i.test(tStr)
    const isAM = /a\.?\s*m\.?/i.test(tStr) || /am/i.test(tStr)
    const cleanTime = tStr.replace(/(a\.?\s*m\.?|p\.?\s*m\.?|am|pm)/gi, '').trim()
    const timeParts = cleanTime.split(':').map(p => parseInt(p, 10) || 0)

    let hours = timeParts[0] || 0
    const minutes = timeParts[1] || 0
    const seconds = timeParts[2] || 0

    if (isPM && hours < 12) hours += 12
    if (isAM && hours === 12) hours = 0

    return new Date(year, month, day, hours, minutes, seconds)
  } catch (err) {
    return new Date()
  }
}

/**
 * Inserts a batch of downtime events into the EVENTOS_DOWNTIME table.
 */
export async function insertEventsToOracle(events) {
  if (!events || events.length === 0) {
    return { insertedCount: 0 }
  }

  let connection
  try {
    connection = await oracledb.getConnection(dbConfig)

    const sql = `
      INSERT INTO EVENTOS_DOWNTIME (
        SISTEMA,
        FINI_CAIDA,
        FFIN_CAIDA,
        INDICADOR,
        MOTIVO
      ) VALUES (
        :sistema,
        :fini_caida,
        :ffin_caida,
        :indicador,
        :motivo
      )
    `

    const binds = events.map(ev => {
      const fini = parseDateTimeToDate(ev.fecha, ev.horaInicio)
      let ffin = parseDateTimeToDate(ev.fecha, ev.horaFin)

      // If end time is before start time, it likely crossed midnight into next day
      if (ffin < fini) {
        ffin = new Date(ffin.getTime() + 86400000)
      }

      return {
        sistema: String(ev.sistema || 'DESCONOCIDO').trim().toUpperCase(),
        fini_caida: fini,
        ffin_caida: ffin,
        indicador: String(ev.indicador || 'II-FALLAS').trim().toUpperCase(),
        motivo: String(ev.motivo || '').trim()
      }
    })

    const result = await connection.executeMany(sql, binds, {
      autoCommit: true
    })

    return {
      insertedCount: result.rowsAffected || events.length,
      success: true
    }
  } finally {
    if (connection) {
      try {
        await connection.close()
      } catch (closeErr) {
        console.error('Error cerrando conexión:', closeErr)
      }
    }
  }
}
