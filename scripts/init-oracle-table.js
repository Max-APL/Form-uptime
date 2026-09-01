import oracledb from 'oracledb'
import dotenv from 'dotenv'

dotenv.config()

const dbConfig = {
  user: process.env.ORACLE_USER || 'SYSTEM',
  password: process.env.ORACLE_PASSWORD || 'oracle',
  connectString: process.env.ORACLE_CONNECT_STRING || '127.0.0.1:1521/XEPDB1'
}

async function initTable() {
  console.log('\n🚀 Verificando/Creando tabla EVENTOS_DOWNTIME en Oracle...')
  let connection
  try {
    connection = await oracledb.getConnection(dbConfig)

    // Check if table exists
    const checkSql = `
      SELECT COUNT(*) FROM USER_TABLES WHERE TABLE_NAME = 'EVENTOS_DOWNTIME'
    `
    const checkRes = await connection.execute(checkSql)
    const exists = checkRes.rows[0][0] > 0

    if (exists) {
      console.log('✅ La tabla EVENTOS_DOWNTIME ya existe en la base de datos Oracle.')
    } else {
      const createTableSql = `
        CREATE TABLE EVENTOS_DOWNTIME (
            ID_EVENTO    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            SISTEMA      VARCHAR2(100) NOT NULL,
            FINI_CAIDA   TIMESTAMP NOT NULL,
            FFIN_CAIDA   TIMESTAMP NOT NULL,
            INDICADOR    VARCHAR2(50) NOT NULL,
            MOTIVO       VARCHAR2(1000),
            CREADO_EN    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      await connection.execute(createTableSql)
      console.log('✅ Tabla EVENTOS_DOWNTIME creada exitosamente en Oracle.')

      try {
        await connection.execute('CREATE INDEX IDX_EVENTOS_FECHAS ON EVENTOS_DOWNTIME (FINI_CAIDA, FFIN_CAIDA)')
        await connection.execute('CREATE INDEX IDX_EVENTOS_SISTEMA ON EVENTOS_DOWNTIME (SISTEMA)')
        console.log('✅ Índices de optimización creados.')
      } catch (idxErr) {
        // Index might already exist
      }
    }
  } catch (err) {
    console.error('❌ Error al inicializar tabla en Oracle:', err.message)
    process.exitCode = 1
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

initTable()
