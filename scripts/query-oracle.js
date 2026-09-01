import oracledb from 'oracledb'
import dotenv from 'dotenv'

dotenv.config()

const dbConfig = {
  user: process.env.ORACLE_USER || 'SYSTEM',
  password: process.env.ORACLE_PASSWORD || 'oracle',
  connectString: process.env.ORACLE_CONNECT_STRING || '127.0.0.1:1521/XEPDB1'
}

async function queryEvents() {
  console.log('\n🔍 Conectando a Oracle Database...')
  console.log(`   Host/Cadena: ${dbConfig.connectString}`)
  console.log(`   Usuario:     ${dbConfig.user}\n`)

  let connection
  try {
    connection = await oracledb.getConnection(dbConfig)
    console.log('✅ Conexión establecida con éxito.\n')

    // 1. Total records count
    const countRes = await connection.execute('SELECT COUNT(*) AS TOTAL FROM EVENTOS_DOWNTIME')
    const totalRows = countRes.rows[0][0]
    console.log(`📊 Total de registros en EVENTOS_DOWNTIME: ${totalRows}\n`)

    if (totalRows === 0) {
      console.log('ℹ️ La tabla EVENTOS_DOWNTIME está vacía. Puedes subir un Excel desde la web para cargar datos.\n')
      return
    }

    // 2. Fetch last 20 events
    const query = `
      SELECT 
        ID_EVENTO,
        SISTEMA,
        TO_CHAR(FINI_CAIDA, 'YYYY-MM-DD HH24:MI:SS') AS INICIO,
        TO_CHAR(FFIN_CAIDA, 'YYYY-MM-DD HH24:MI:SS') AS FIN,
        INDICADOR,
        SUBSTR(MOTIVO, 1, 40) AS MOTIVO_CORTO,
        TO_CHAR(CREADO_EN, 'YYYY-MM-DD HH24:MI:SS') AS CREADO_EN
      FROM EVENTOS_DOWNTIME
      ORDER BY ID_EVENTO DESC
      FETCH FIRST 20 ROWS ONLY
    `

    const res = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT })
    
    console.log('📋 Últimos registros insertados:')
    console.table(res.rows)

  } catch (err) {
    console.error('❌ Error al consultar Oracle:', err.message)
    console.log('\n💡 Sugerencias:')
    console.log('   1. Revisa que tu base de datos Oracle esté encendida y accesible.')
    console.log('   2. Verifica tus credenciales en el archivo .env.')
    console.log('   3. Si no has creado la tabla, puedes ejecutar "npm run db:init".\n')
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

queryEvents()
