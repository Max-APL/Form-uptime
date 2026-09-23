-- ==========================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS - ORACLE
-- Tabla para almacenamiento de eventos e incidentes de caídas
-- ==========================================================

-- 1. Crear tabla EVENTOS_DOWNTIME
CREATE TABLE EVENTOS_DOWNTIME (
    ID_EVENTO    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    SISTEMA      VARCHAR2(100) NOT NULL,
    FINI_CAIDA   TIMESTAMP NOT NULL,
    FFIN_CAIDA   TIMESTAMP NOT NULL,
    INDICADOR    VARCHAR2(50) NOT NULL,
    MOTIVO       VARCHAR2(1000),
    CREADO_EN    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Comentarios explicativos en las columnas
COMMENT ON TABLE EVENTOS_DOWNTIME IS 'Registro histórico de incidentes y caídas de sistemas BMSC para cálculo de Uptime/Downtime';
COMMENT ON COLUMN EVENTOS_DOWNTIME.ID_EVENTO IS 'Identificador único autoincremental de la caída';
COMMENT ON COLUMN EVENTOS_DOWNTIME.SISTEMA IS 'Nombre del sistema afectado (ej. CORE T24, BANCA MOVIL, ACH)';
COMMENT ON COLUMN EVENTOS_DOWNTIME.FINI_CAIDA IS 'Fecha y hora exacta de inicio de la indisponibilidad';
COMMENT ON COLUMN EVENTOS_DOWNTIME.FFIN_CAIDA IS 'Fecha y hora exacta de restablecimiento del servicio';
COMMENT ON COLUMN EVENTOS_DOWNTIME.INDICADOR IS 'Categoría del incidente (II-FALLAS, II-PROGRAMADA, II-PROVEEDOR)';
COMMENT ON COLUMN EVENTOS_DOWNTIME.MOTIVO IS 'Descripción técnica de la causa del incidente';
COMMENT ON COLUMN EVENTOS_DOWNTIME.CREADO_EN IS 'Fecha y hora de inserción del registro en base de datos';

-- 3. Índices de optimización para reportes mensuales
CREATE INDEX IDX_EVENTOS_FECHAS ON EVENTOS_DOWNTIME (FINI_CAIDA, FFIN_CAIDA);
CREATE INDEX IDX_EVENTOS_SISTEMA ON EVENTOS_DOWNTIME (SISTEMA);

-- 4. Ejemplo de inserción manual
-- INSERT INTO EVENTOS_DOWNTIME (SISTEMA, FINI_CAIDA, FFIN_CAIDA, INDICADOR, MOTIVO)
-- VALUES ('CORE T24', TO_TIMESTAMP('2026-03-25 22:31:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2026-03-25 23:05:00', 'YYYY-MM-DD HH24:MI:SS'), 'II-FALLAS', 'Contención BD');

-- ==========================================================
-- 5. Crear tabla EVENTOS_REDES (Enlaces WAN, Agencias, ATMs)
-- ==========================================================
CREATE TABLE EVENTOS_REDES (
    ID_EVENTO       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CREADO_EN       TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FECHA           DATE DEFAULT SYSDATE NOT NULL,
    ENLACE          VARCHAR2(150) NOT NULL,
    DEPARTAMENTO    VARCHAR2(100),
    NOMBRE          VARCHAR2(200) NOT NULL,
    UPTIME_MENSUAL  NUMBER(7,4) NOT NULL,
    UPTIME_ANUAL    NUMBER(7,4) NOT NULL
);

COMMENT ON TABLE EVENTOS_REDES IS 'Registro mensual de disponibilidad de enlaces de red (WAN, Agencias, ATMs)';
COMMENT ON COLUMN EVENTOS_REDES.ID_EVENTO IS 'Identificador autoincremental del registro';
COMMENT ON COLUMN EVENTOS_REDES.CREADO_EN IS 'Fecha y hora de inserción (Datetime)';
COMMENT ON COLUMN EVENTOS_REDES.FECHA IS 'Fecha asignada al período mensual (Date)';
COMMENT ON COLUMN EVENTOS_REDES.ENLACE IS 'Tipo de enlace (ej. ENLACES WAN NACIONAL, AGENCIAS, ATMS)';
COMMENT ON COLUMN EVENTOS_REDES.DEPARTAMENTO IS 'Departamento o región geográfica (ej. LA PAZ, SANTA CRUZ, NACIONAL)';
COMMENT ON COLUMN EVENTOS_REDES.NOMBRE IS 'Proveedor / Agencia / ATM evaluado';
COMMENT ON COLUMN EVENTOS_REDES.UPTIME_MENSUAL IS 'Porcentaje de uptime del mes (ej. 99.9800)';
COMMENT ON COLUMN EVENTOS_REDES.UPTIME_ANUAL IS 'Porcentaje de uptime acumulado anual (ej. 99.9950)';

CREATE INDEX IDX_REDES_FECHA ON EVENTOS_REDES (FECHA);

COMMIT;
