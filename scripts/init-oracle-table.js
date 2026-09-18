import oracledb from 'oracledb'
import dotenv from 'dotenv'

dotenv.config()

const dbConfig = {
  user: process.env.ORACLE_USER || 'SYSTEM',
  password: process.env.ORACLE_PASSWORD || 'oracle',
  connectString: process.env.ORACLE_CONNECT_STRING || '127.0.0.1:1521/XEPDB1'
}

const TABLE_NAME = process.env.ORACLE_TABLE_NAME || 'EVENTOS_DOWNTIME'

async function initTable() {
  console.log(`\n🚀 Verificando/Creando tabla ${TABLE_NAME} en Oracle...`)
  let connection
  try {
    connection = await oracledb.getConnection(dbConfig)

    // Check if table exists
    const checkSql = `SELECT COUNT(*) FROM USER_TABLES WHERE TABLE_NAME = '${TABLE_NAME}'`
    const checkRes = await connection.execute(checkSql)
    const exists = checkRes.rows[0][0] > 0

    if (exists) {
      console.log(`✅ La tabla ${TABLE_NAME} ya existe en la base de datos Oracle. Verificando columnas...`)
      
      // Ensure all V2 columns exist (auto-migration)
      const columnsToAdd = [
        { name: 'COMPONENTE', ddl: 'ADD (COMPONENTE VARCHAR2(150))' },
        { name: 'RESPONSABLE', ddl: 'ADD (RESPONSABLE VARCHAR2(150))' },
        { name: 'ORIGEN', ddl: 'ADD (ORIGEN VARCHAR2(100))' },
        { name: 'DECLARADO', ddl: 'ADD (DECLARADO NUMBER(1) DEFAULT 0)' },
        { name: 'BITACORA', ddl: 'ADD (BITACORA VARCHAR2(200))' },
        { name: 'SOLUCION', ddl: 'ADD (SOLUCION VARCHAR2(2000))' }
      ]

      for (const col of columnsToAdd) {
        try {
          await connection.execute(`ALTER TABLE ${TABLE_NAME} ${col.ddl}`)
          console.log(`  ➕ Columna ${col.name} agregada exitosamente.`)
        } catch (err) {
          // ORA-01430: column being added already exists in table
          if (err.errorNum === 1430 || err.message.includes('ORA-01430')) {
            // Already exists, fine
          } else {
            console.warn(`  ⚠️ Nota columna ${col.name}:`, err.message)
          }
        }
      }
      console.log('✅ Esquema verificado con todas las columnas V2.')
    } else {
      const createTableSql = `
        CREATE TABLE ${TABLE_NAME} (
            ID_EVENTO    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            SISTEMA      VARCHAR2(100) NOT NULL,
            COMPONENTE   VARCHAR2(150),
            FINI_CAIDA   TIMESTAMP NOT NULL,
            FFIN_CAIDA   TIMESTAMP NOT NULL,
            INDICADOR    VARCHAR2(50) NOT NULL,
            RESPONSABLE  VARCHAR2(150),
            ORIGEN       VARCHAR2(100),
            DECLARADO    NUMBER(1) DEFAULT 0,
            BITACORA     VARCHAR2(200),
            MOTIVO       VARCHAR2(2000),
            SOLUCION     VARCHAR2(2000),
            CREADO_EN    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      await connection.execute(createTableSql)
      console.log(`✅ Tabla ${TABLE_NAME} creada exitosamente en Oracle con soporte V2 completo.`)

      try {
        await connection.execute(`CREATE INDEX IDX_${TABLE_NAME}_FECHAS ON ${TABLE_NAME} (FINI_CAIDA, FFIN_CAIDA)`)
        await connection.execute(`CREATE INDEX IDX_${TABLE_NAME}_SISTEMA ON ${TABLE_NAME} (SISTEMA)`)
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
