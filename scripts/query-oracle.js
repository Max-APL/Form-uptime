import oracledb from 'oracledb'
import dotenv from 'dotenv'

dotenv.config()

const dbConfig = {
  user: process.env.ORACLE_USER || 'SYSTEM',
  password: process.env.ORACLE_PASSWORD || 'oracle',
  connectString: process.env.ORACLE_CONNECT_STRING || '127.0.0.1:1521/XEPDB1'
}

const TABLE_NAME = process.env.ORACLE_TABLE_NAME || 'EVENTOS_DOWNTIME'

async function queryEvents() {
  console.log('\n🔍 Conectando a Oracle Database...')
  console.log(`   Host/Cadena: ${dbConfig.connectString}`)
  console.log(`   Usuario:     ${dbConfig.user}`)
  console.log(`   Tabla:       ${TABLE_NAME}\n`)

  let connection
  try {
    connection = await oracledb.getConnection(dbConfig)
    console.log('✅ Conexión establecida con éxito.\n')

    // 1. Total records count
    const countRes = await connection.execute(`SELECT COUNT(*) AS TOTAL FROM ${TABLE_NAME}`)
    const totalRows = countRes.rows[0][0]
    console.log(`📊 Total de registros en ${TABLE_NAME}: ${totalRows}\n`)

    if (totalRows === 0) {
      console.log(`ℹ️ La tabla ${TABLE_NAME} está vacía. Puedes agregar registros desde la interfaz web o sincronizarlos.\n`)
      return
    }

    // 2. Fetch last 20 events
    const query = `
      SELECT 
        ID_EVENTO,
        SISTEMA,
        COMPONENTE,
        TO_CHAR(FINI_CAIDA, 'YYYY-MM-DD HH24:MI:SS') AS INICIO,
        TO_CHAR(FFIN_CAIDA, 'YYYY-MM-DD HH24:MI:SS') AS FIN,
        INDICADOR,
        RESPONSABLE,
        ORIGEN,
        DECLARADO,
        BITACORA,
        SUBSTR(MOTIVO, 1, 30) AS MOTIVO_CORTO
      FROM ${TABLE_NAME}
      ORDER BY ID_EVENTO DESC
      FETCH FIRST 20 ROWS ONLY
    `

    const res = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT })
    
    console.log('📋 Últimos registros insertados:')
    console.table(res.rows)

  } catch (err) {
    console.error('❌ Error al consultar Oracle:', err.message)
  } finally {
    if (connection) {
      try {
        await connection.close()
      } catch (closeErr) {
        console.error(closeErr)
      }
    }
  }
}

queryEvents()
