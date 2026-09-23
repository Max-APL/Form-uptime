import oracledb from 'oracledb'
import dotenv from 'dotenv'

dotenv.config()

const dbConfig = {
  user: process.env.ORACLE_USER || 'SYSTEM',
  password: process.env.ORACLE_PASSWORD || 'oracle',
  connectString: process.env.ORACLE_CONNECT_STRING || '127.0.0.1:1521/XEPDB1'
}

const TABLE_NAME = process.env.ORACLE_REDES_TABLE_NAME || 'EVENTOS_REDES'

async function initNetworkTable() {
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

      // Ensure all required columns exist (auto-migration)
      const columnsToAdd = [
        { name: 'DEPARTAMENTO', ddl: 'ADD (DEPARTAMENTO VARCHAR2(100))' },
        { name: 'ENLACE', ddl: 'ADD (ENLACE VARCHAR2(150))' },
        { name: 'NOMBRE', ddl: 'ADD (NOMBRE VARCHAR2(200))' },
        { name: 'UPTIME_MENSUAL', ddl: 'ADD (UPTIME_MENSUAL NUMBER(7,4) DEFAULT 100)' },
        { name: 'UPTIME_ANUAL', ddl: 'ADD (UPTIME_ANUAL NUMBER(7,4) DEFAULT 100)' }
      ]

      for (const col of columnsToAdd) {
        try {
          await connection.execute(`ALTER TABLE ${TABLE_NAME} ${col.ddl}`)
          console.log(`  ➕ Columna ${col.name} agregada exitosamente a ${TABLE_NAME}.`)
        } catch (colErr) {
          // ORA-01430: column being added already exists in table
          if (colErr.errorNum === 1430 || colErr.message.includes('ORA-01430')) {
            // Columna ya existe, ignorar
          } else {
            console.warn(`  ⚠️ Nota columna ${col.name}:`, colErr.message)
          }
        }
      }
      console.log(`✅ Esquema de ${TABLE_NAME} verificado y actualizado con éxito.`)
    } else {
      const createTableSql = `
        CREATE TABLE ${TABLE_NAME} (
            ID_EVENTO       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            CREADO_EN       TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            FECHA           DATE DEFAULT SYSDATE NOT NULL,
            ENLACE          VARCHAR2(150) NOT NULL,
            DEPARTAMENTO    VARCHAR2(100),
            NOMBRE          VARCHAR2(200) NOT NULL,
            UPTIME_MENSUAL  NUMBER(7,4) NOT NULL,
            UPTIME_ANUAL    NUMBER(7,4) NOT NULL
        )
      `
      await connection.execute(createTableSql)
      console.log(`🎉 Tabla ${TABLE_NAME} creada exitosamente en Oracle.`)

      // Create index on FECHA for fast period filtering
      try {
        await connection.execute(`CREATE INDEX IDX_${TABLE_NAME}_FECHA ON ${TABLE_NAME} (FECHA)`)
        console.log(`✅ Índice en FECHA creado exitosamente.`)
      } catch (idxErr) {
        console.warn('Nota índice:', idxErr.message)
      }
    }
  } catch (err) {
    console.error('❌ Error al inicializar la tabla de redes en Oracle:', err.message)
  } finally {
    if (connection) {
      try {
        await connection.close()
      } catch (err) {
        console.error('Error cerrando conexión:', err)
      }
    }
  }
}

initNetworkTable()
