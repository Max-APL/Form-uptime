import oracledb from 'oracledb'
import dotenv from 'dotenv'

dotenv.config()

const dbConfig = {
  user: process.env.ORACLE_USER || 'SYSTEM',
  password: process.env.ORACLE_PASSWORD || 'oracle',
  connectString: process.env.ORACLE_CONNECT_STRING || '127.0.0.1:1521/XEPDB1'
}

const TABLE_NAME = process.env.ORACLE_TABLE_NAME || 'EVENTOS_DOWNTIME'

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
    console.log(`✅ Pool de conexiones Oracle inicializado exitosamente (Tabla: ${TABLE_NAME}).`)
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
    await connection.execute('SELECT 1 FROM DUAL')
    return {
      connected: true,
      message: 'Conectado a Oracle Database exitosamente',
      user: dbConfig.user,
      connectString: dbConfig.connectString,
      table: TABLE_NAME
    }
  } catch (err) {
    return {
      connected: false,
      message: err.message,
      user: dbConfig.user,
      connectString: dbConfig.connectString,
      table: TABLE_NAME
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
         FROM ${TABLE_NAME}
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
 * Formats a Date object to YYYY-MM-DD
 */
function formatDateToYMD(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formats a Date object to HH:mm:ss
 */
function formatTimeToHMS(date) {
  const d = new Date(date)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

/**
 * Formats seconds into HH:mm:ss
 */
function formatSecondsToHMS(totalSec) {
  const h = Math.floor(totalSec / 3600).toString().padStart(2, '0')
  const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0')
  const s = (totalSec % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

/**
 * Returns the events stored for a calendar period, ordered chronologically.
 */
export async function getEventsByPeriod(year, month) {
  let connection
  try {
    connection = await oracledb.getConnection(dbConfig)
    const result = await connection.execute(
      `SELECT ID_EVENTO,
              SISTEMA,
              COMPONENTE,
              FINI_CAIDA,
              FFIN_CAIDA,
              INDICADOR,
              RESPONSABLE,
              ORIGEN,
              DECLARADO,
              REVISION,
              BITACORA,
              MOTIVO,
              SOLUCION,
              ROUND((CAST(FFIN_CAIDA AS DATE) - CAST(FINI_CAIDA AS DATE)) * 24 * 60, 2) AS DURACION_MINUTOS
         FROM ${TABLE_NAME}
        WHERE FINI_CAIDA >= :periodStart
          AND FINI_CAIDA < :periodEnd
        ORDER BY ID_EVENTO, FINI_CAIDA, SISTEMA`,
      {
        periodStart: new Date(year, month - 1, 1),
        periodEnd: new Date(year, month, 1)
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    )

    return (result.rows || []).map((row, index) => {
      const durMin = Number(row.DURACION_MINUTOS || 0)
      const sec = Math.round(durMin * 60)
      const finiDate = new Date(row.FINI_CAIDA)
      const ffinDate = new Date(row.FFIN_CAIDA)
      const sysClean = String(row.SISTEMA || '').trim()

      return {
        id: `ora-${row.ID_EVENTO}`,
        dbId: row.ID_EVENTO,
        sistema: sysClean === 'DESCONOCIDO' ? '' : sysClean,
        componente: row.COMPONENTE || '',
        fecha: formatDateToYMD(finiDate),
        horaInicio: formatTimeToHMS(finiDate),
        horaFin: formatTimeToHMS(ffinDate),
        tiempoServicioAbajo: formatSecondsToHMS(sec),
        durationMinutes: durMin,
        durationSeconds: sec,
        indicador: row.INDICADOR || 'II-FALLAS',
        responsable: row.RESPONSABLE || '',
        origen: row.ORIGEN || '',
        declarado: row.DECLARADO === 1,
        revision: row.REVISION === 1,
        bitacora: row.BITACORA || '',
        motivo: row.MOTIVO || '',
        solucion: row.SOLUCION || '',
        // Legacy backward-compatibility aliases
        inicio: row.FINI_CAIDA,
        fin: row.FFIN_CAIDA,
        duracionMinutos: durMin
      }
    })
  } finally {
    if (connection) await connection.close()
  }
}

/**
 * Parses raw date string and time string into a valid JavaScript Date object for Oracle TIMESTAMP.
 */
function parseDateTimeToDate(dateStr, timeStr) {
  try {
    let year = new Date().getFullYear()
    let month = new Date().getMonth()
    let day = new Date().getDate()

    const dStr = String(dateStr || '').toLowerCase().trim()
    const tStr = String(timeStr || '').toLowerCase().trim()

    // YYYY-MM-DD
    const ymdMatch = dStr.match(/(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})/)
    if (ymdMatch) {
      year = parseInt(ymdMatch[1], 10)
      month = parseInt(ymdMatch[2], 10) - 1
      day = parseInt(ymdMatch[3], 10)
    } else {
      // DD/MM/YYYY
      const dmyMatch = dStr.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/)
      if (dmyMatch) {
        day = parseInt(dmyMatch[1], 10)
        month = parseInt(dmyMatch[2], 10) - 1
        year = parseInt(dmyMatch[3], 10)
      } else {
        // Spanish month names (e.g. 31 de agosto de 2026)
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
      }
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
 * Inserts a batch of downtime events into the Oracle table.
 */
export async function insertEventsToOracle(events) {
  if (!events || events.length === 0) {
    return { insertedCount: 0 }
  }

  let connection
  try {
    connection = await oracledb.getConnection(dbConfig)

    const sql = `
      INSERT INTO ${TABLE_NAME} (
        SISTEMA,
        COMPONENTE,
        FINI_CAIDA,
        FFIN_CAIDA,
        INDICADOR,
        RESPONSABLE,
        ORIGEN,
        DECLARADO,
        REVISION,
        BITACORA,
        MOTIVO,
        SOLUCION
      ) VALUES (
        :sistema,
        :componente,
        :fini_caida,
        :ffin_caida,
        :indicador,
        :responsable,
        :origen,
        :declarado,
        :revision,
        :bitacora,
        :motivo,
        :solucion
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
        componente: String(ev.componente || '').trim(),
        fini_caida: fini,
        ffin_caida: ffin,
        indicador: String(ev.indicador || 'II-FALLAS').trim().toUpperCase(),
        responsable: String(ev.responsable || '').trim(),
        origen: String(ev.origen || '').trim(),
        declarado: ev.declarado ? 1 : 0,
        revision: ev.revision ? 1 : 0,
        bitacora: String(ev.bitacora || '').trim(),
        motivo: String(ev.motivo || '').trim(),
        solucion: String(ev.solucion || '').trim()
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

/**
 * Transactionally replaces all events for a given period (year, month).
 * Prevents duplicates while ensuring modifications and new rows are committed cleanly.
 */
export async function syncPeriodEventsToOracle(year, month, events) {
  if (!events || !Array.isArray(events)) {
    return { insertedCount: 0, success: true }
  }

  let connection
  try {
    connection = await oracledb.getConnection(dbConfig)

    // 1. Delete previous records for the period within the transaction
    if (year && month) {
      await connection.execute(
        `DELETE FROM ${TABLE_NAME}
          WHERE FINI_CAIDA >= :periodStart
            AND FINI_CAIDA < :periodEnd`,
        {
          periodStart: new Date(year, month - 1, 1),
          periodEnd: new Date(year, month, 1)
        },
        { autoCommit: false }
      )
    }

    // 2. Insert the current verified rows
    if (events.length > 0) {
      const sql = `
        INSERT INTO ${TABLE_NAME} (
          SISTEMA,
          COMPONENTE,
          FINI_CAIDA,
          FFIN_CAIDA,
          INDICADOR,
          RESPONSABLE,
          ORIGEN,
          DECLARADO,
          REVISION,
          BITACORA,
          MOTIVO,
          SOLUCION
        ) VALUES (
          :sistema,
          :componente,
          :fini_caida,
          :ffin_caida,
          :indicador,
          :responsable,
          :origen,
          :declarado,
          :revision,
          :bitacora,
          :motivo,
          :solucion
        )
      `

      const binds = events.map(ev => {
        const fini = parseDateTimeToDate(ev.fecha, ev.horaInicio)
        let ffin = parseDateTimeToDate(ev.fecha, ev.horaFin)
        if (ffin < fini) {
          ffin = new Date(ffin.getTime() + 86400000)
        }

        return {
          sistema: String(ev.sistema || 'DESCONOCIDO').trim().toUpperCase(),
          componente: String(ev.componente || '').trim(),
          fini_caida: fini,
          ffin_caida: ffin,
          indicador: String(ev.indicador || 'II-FALLAS').trim().toUpperCase(),
          responsable: String(ev.responsable || '').trim(),
          origen: String(ev.origen || '').trim(),
          declarado: ev.declarado ? 1 : 0,
          revision: ev.revision ? 1 : 0,
          bitacora: String(ev.bitacora || '').trim(),
          motivo: String(ev.motivo || '').trim(),
          solucion: String(ev.solucion || '').trim()
        }
      })

      await connection.executeMany(sql, binds, { autoCommit: false })
    }

    // 3. Commit the transaction
    await connection.commit()

    return {
      insertedCount: events.length,
      success: true
    }
  } catch (err) {
    if (connection) {
      try {
        await connection.rollback()
      } catch (rbErr) {
        console.error('Error durante el rollback en Oracle:', rbErr)
      }
    }
    throw err
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

// Aliases for full backward and cross compatibility
export const getEventsByPeriodV2 = getEventsByPeriod
export const insertEventsToOracleV2 = insertEventsToOracle
export const syncPeriodEventsToOracleV2 = syncPeriodEventsToOracle

const REDES_TABLE_NAME = process.env.ORACLE_REDES_TABLE_NAME || 'EVENTOS_REDES'

/**
 * Consulta registros de la tabla EVENTOS_REDES para un período (año y mes)
 */
export async function getNetworkEventsByPeriod(year, month) {
  let connection
  try {
    connection = await oracledb.getConnection(dbConfig)

    const sql = `
      SELECT
        ID_EVENTO,
        CREADO_EN,
        FECHA,
        ENLACE,
        DEPARTAMENTO,
        NOMBRE,
        UPTIME_MENSUAL,
        UPTIME_ANUAL
      FROM ${REDES_TABLE_NAME}
      WHERE EXTRACT(YEAR FROM FECHA) = :year
        AND EXTRACT(MONTH FROM FECHA) = :month
      ORDER BY DEPARTAMENTO ASC, NOMBRE ASC
    `

    const result = await connection.execute(sql, { year, month })

    const records = (result.rows || []).map(row => {
      let fechaStr = ''
      if (row[2]) {
        const d = new Date(row[2])
        fechaStr = !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : String(row[2])
      }

      let creadoEnStr = new Date().toISOString()
      if (row[1]) {
        const c = new Date(row[1])
        creadoEnStr = !isNaN(c.getTime()) ? c.toISOString() : String(row[1])
      }

      return {
        id: `net_${row[0]}`,
        dbId: row[0],
        creadoEn: creadoEnStr,
        fecha: fechaStr,
        enlace: row[3] || 'ENLACES WAN NACIONAL',
        departamento: row[4] || 'NACIONAL',
        nombre: row[5] || '',
        uptimeMensual: Number(row[6]) || 100,
        uptimeAnual: Number(row[7]) || 100
      }
    })

    return {
      year,
      month,
      count: records.length,
      records
    }
  } catch (err) {
    console.error('Error al consultar EVENTOS_REDES en Oracle:', err)
    throw err
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

/**
 * Sincroniza / guarda los registros de EVENTOS_REDES para un período
 */
export async function syncNetworkEventsToOracle(year, month, records) {
  let connection
  try {
    connection = await oracledb.getConnection(dbConfig)

    // 1. Delete existing records for this month/year
    const deleteSql = `
      DELETE FROM ${REDES_TABLE_NAME}
      WHERE EXTRACT(YEAR FROM FECHA) = :year
        AND EXTRACT(MONTH FROM FECHA) = :month
    `
    await connection.execute(deleteSql, { year, month }, { autoCommit: false })

    // 2. Insert new records
    if (Array.isArray(records) && records.length > 0) {
      const insertSql = `
        INSERT INTO ${REDES_TABLE_NAME} (
          FECHA,
          ENLACE,
          DEPARTAMENTO,
          NOMBRE,
          UPTIME_MENSUAL,
          UPTIME_ANUAL
        ) VALUES (
          :fecha,
          :enlace,
          :departamento,
          :nombre,
          :uptime_mensual,
          :uptime_anual
        )
      `

      const defaultDate = new Date(year, month - 1, 15, 12, 0, 0)

      const binds = records.map(r => {
        let f = defaultDate
        if (r.fecha) {
          const parts = r.fecha.split('-').map(Number)
          if (parts.length === 3) {
            f = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0)
          }
        }

        return {
          fecha: f,
          enlace: String(r.enlace || 'ENLACES WAN NACIONAL').trim().toUpperCase(),
          departamento: String(r.departamento || 'NACIONAL').trim().toUpperCase(),
          nombre: String(r.nombre || '').trim(),
          uptime_mensual: Number(r.uptimeMensual) || 100,
          uptime_anual: Number(r.uptimeAnual) || 100
        }
      })

      await connection.executeMany(insertSql, binds, { autoCommit: false })
    }

    // 3. Commit
    await connection.commit()

    return {
      success: true,
      insertedCount: records.length
    }
  } catch (err) {
    if (connection) {
      try {
        await connection.rollback()
      } catch (rbErr) {
        console.error('Error en rollback de EVENTOS_REDES:', rbErr)
      }
    }
    throw err
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

