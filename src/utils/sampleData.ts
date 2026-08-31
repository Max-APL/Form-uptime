import type { RawEventRecord } from '../types/uptime'

export const SAMPLE_JUNE_EVENTS: RawEventRecord[] = [
  {
    id: 'evt-1',
    sistema: 'CORE T24',
    fecha: 'jueves, 18 de junio de 2026',
    horaInicio: '10:25:00 a. m.',
    horaFin: '11:06:00 a. m.',
    tiempoServicioAbajo: '00:41:00',
    indicador: 'II-FALLAS',
    motivo: 'Problemas en inicios de sesión de usuarios, por bloqueo en tabla de registro de sesiones.',
    durationMinutes: 41,
    durationSeconds: 2460
  },
  {
    id: 'evt-2',
    sistema: 'ICBANKING',
    fecha: 'martes, 9 de junio de 2026',
    horaInicio: '03:15:00 a. m.',
    horaFin: '03:46:00 a. m.',
    tiempoServicioAbajo: '00:31:00',
    indicador: 'II-FALLAS',
    motivo: 'Error de comunicación con base de datos por timeout en pool de conexiones.',
    durationMinutes: 31,
    durationSeconds: 1860
  },
  {
    id: 'evt-3',
    sistema: 'BANCA MOVIL',
    fecha: 'viernes, 12 de junio de 2026',
    horaInicio: '14:20:00',
    horaFin: '15:13:00',
    tiempoServicioAbajo: '00:53:00',
    indicador: 'II-FALLAS',
    motivo: 'Lentitud y desconexión en microservicio de autenticación biométrica.',
    durationMinutes: 53,
    durationSeconds: 3180
  },
  {
    id: 'evt-4',
    sistema: 'ACH',
    fecha: 'miércoles, 3 de junio de 2026',
    horaInicio: '01:00:00',
    horaFin: '01:58:00',
    tiempoServicioAbajo: '00:58:00',
    indicador: 'II-PROGRAMADA',
    motivo: 'Actualización y parche mensual de seguridad en pasarela ACH.',
    durationMinutes: 58,
    durationSeconds: 3480
  },
  {
    id: 'evt-5',
    sistema: 'ACH',
    fecha: 'lunes, 22 de junio de 2026',
    horaInicio: '09:10:00',
    horaFin: '09:21:00',
    tiempoServicioAbajo: '00:11:00',
    indicador: 'II-FALLAS',
    motivo: 'Reinicio no programado de cola MQ de transacciones ACH.',
    durationMinutes: 11,
    durationSeconds: 660
  },
  {
    id: 'evt-6',
    sistema: 'SWIFT',
    fecha: 'sábado, 27 de junio de 2026',
    horaInicio: '18:00:00',
    horaFin: '18:45:00',
    tiempoServicioAbajo: '00:45:00',
    indicador: 'II-FALLAS',
    motivo: 'Falla en enlace de contingencia Alliance Lite2.',
    durationMinutes: 45,
    durationSeconds: 2700
  }
]

export const SAMPLE_JULY_EVENTS: RawEventRecord[] = [
  {
    id: 'evt-j1',
    sistema: 'BANCA POR INTERNET',
    fecha: 'miércoles, 15 de julio de 2026',
    horaInicio: '08:00:00',
    horaFin: '14:52:00',
    tiempoServicioAbajo: '06:52:00',
    indicador: 'IIBHIBM FALLAS',
    motivo: 'Indisponibilidad en pasarela web por saturación de sesiones concurrentes.',
    durationMinutes: 412,
    durationSeconds: 24720
  },
  {
    id: 'evt-j2',
    sistema: 'BANCA MOVIL',
    fecha: 'domingo, 5 de julio de 2026',
    horaInicio: '03:00:00',
    horaFin: '03:18:00',
    tiempoServicioAbajo: '00:18:00',
    indicador: 'IIBHIBM PROGRAMADA',
    motivo: 'Ventana de mantenimiento preventiva de servidores.',
    durationMinutes: 18,
    durationSeconds: 1080
  }
]

export const SAMPLE_MARCH_EVENTS: RawEventRecord[] = [
  // CORE T24
  {
    id: 'mar-1',
    sistema: 'CORE T24',
    fecha: 'miércoles, 25 de marzo de 2026',
    horaInicio: '10:31:00 p. m.',
    horaFin: '11:05:00 p. m.',
    tiempoServicioAbajo: '00:34:00',
    indicador: 'II-FALLAS',
    motivo: 'Contención BD',
    durationMinutes: 34,
    durationSeconds: 2040
  },
  // BANCA MOVIL
  {
    id: 'mar-2',
    sistema: 'BANCA MOVIL',
    fecha: 'miércoles, 4 de marzo de 2026',
    horaInicio: '1:12:00 p. m.',
    horaFin: '1:36:00 p. m.',
    tiempoServicioAbajo: '00:24:00',
    indicador: 'II-FALLAS',
    motivo: 'Estabilización nuevo Sistema Core (Ajustes)',
    durationMinutes: 24,
    durationSeconds: 1440
  },
  {
    id: 'mar-3',
    sistema: 'BANCA MOVIL',
    fecha: 'viernes, 6 de marzo de 2026',
    horaInicio: '5:46:00 p. m.',
    horaFin: '6:12:00 p. m.',
    tiempoServicioAbajo: '00:26:00',
    indicador: 'II-FALLAS',
    motivo: 'Estabilización nuevo Sistema Core (Ajustes)',
    durationMinutes: 26,
    durationSeconds: 1560
  },
  {
    id: 'mar-4',
    sistema: 'BANCA MOVIL',
    fecha: 'jueves, 12 de marzo de 2026',
    horaInicio: '1:01:00 a. m.',
    horaFin: '1:13:00 a. m.',
    tiempoServicioAbajo: '00:12:00',
    indicador: 'II-PROGRAMADA',
    motivo: 'Mantenimiento plataforma BM',
    durationMinutes: 12,
    durationSeconds: 720
  },
  {
    id: 'mar-5',
    sistema: 'BANCA MOVIL',
    fecha: 'martes, 17 de marzo de 2026',
    horaInicio: '2:12:00 a. m.',
    horaFin: '2:25:00 a. m.',
    tiempoServicioAbajo: '00:13:00',
    indicador: 'II-PROGRAMADA',
    motivo: 'Mantenimiento plataforma BM',
    durationMinutes: 13,
    durationSeconds: 780
  },
  {
    id: 'mar-6',
    sistema: 'BANCA MOVIL',
    fecha: 'sábado, 21 de marzo de 2026',
    horaInicio: '3:58:00 p. m.',
    horaFin: '4:39:00 p. m.',
    tiempoServicioAbajo: '00:41:00',
    indicador: 'II-FALLAS',
    motivo: 'Estabilización nuevo Sistema Core (Ajustes)',
    durationMinutes: 41,
    durationSeconds: 2460
  },
  {
    id: 'mar-7',
    sistema: 'BANCA MOVIL',
    fecha: 'domingo, 29 de marzo de 2026',
    horaInicio: '3:48:00 a. m.',
    horaFin: '4:26:00 a. m.',
    tiempoServicioAbajo: '00:38:00',
    indicador: 'II-PROGRAMADA',
    motivo: 'Ajustes y mejoras OSB - T24 (estabilización)',
    durationMinutes: 38,
    durationSeconds: 2280
  },
  // ACH
  {
    id: 'mar-8',
    sistema: 'ACH',
    fecha: 'martes, 3 de marzo de 2026',
    horaInicio: '3:05:00 p. m.',
    horaFin: '4:45:00 p. m.',
    tiempoServicioAbajo: '01:40:00',
    indicador: 'II-FALLAS',
    motivo: 'Estabilización nuevo Sistema Core (Ajustes)',
    durationMinutes: 100,
    durationSeconds: 6000
  },
  {
    id: 'mar-9',
    sistema: 'ACH',
    fecha: 'martes, 3 de marzo de 2026',
    horaInicio: '5:10:00 p. m.',
    horaFin: '5:28:00 p. m.',
    tiempoServicioAbajo: '00:18:00',
    indicador: 'II-FALLAS',
    motivo: 'Estabilización nuevo Sistema Core (Ajustes)',
    durationMinutes: 18,
    durationSeconds: 1080
  },
  {
    id: 'mar-10',
    sistema: 'ACH',
    fecha: 'miércoles, 4 de marzo de 2026',
    horaInicio: '12:39:00 p. m.',
    horaFin: '1:52:00 p. m.',
    tiempoServicioAbajo: '01:13:00',
    indicador: 'II-FALLAS',
    motivo: 'Estabilización nuevo Sistema Core (Ajustes)',
    durationMinutes: 73,
    durationSeconds: 4380
  },
  {
    id: 'mar-11',
    sistema: 'ACH',
    fecha: 'viernes, 6 de marzo de 2026',
    horaInicio: '4:36:00 p. m.',
    horaFin: '6:38:00 p. m.',
    tiempoServicioAbajo: '02:02:00',
    indicador: 'II-FALLAS',
    motivo: 'Estabilización nuevo Sistema Core (Ajustes)',
    durationMinutes: 122,
    durationSeconds: 7320
  },
  {
    id: 'mar-12',
    sistema: 'ACH',
    fecha: 'viernes, 6 de marzo de 2026',
    horaInicio: '4:39:00 p. m.',
    horaFin: '5:11:00 p. m.',
    tiempoServicioAbajo: '00:32:00',
    indicador: 'II-FALLAS',
    motivo: 'Estabilización nuevo Sistema Core (Ajustes)',
    durationMinutes: 32,
    durationSeconds: 1920
  },
  {
    id: 'mar-13',
    sistema: 'ACH',
    fecha: 'viernes, 6 de marzo de 2026',
    horaInicio: '5:45:00 p. m.',
    horaFin: '6:13:00 p. m.',
    tiempoServicioAbajo: '00:28:00',
    indicador: 'II-FALLAS',
    motivo: 'Estabilización nuevo Sistema Core (Ajustes)',
    durationMinutes: 28,
    durationSeconds: 1680
  },
  {
    id: 'mar-14',
    sistema: 'ACH',
    fecha: 'domingo, 8 de marzo de 2026',
    horaInicio: '4:09:00 a. m.',
    horaFin: '4:39:00 a. m.',
    tiempoServicioAbajo: '00:30:00',
    indicador: 'II-PROGRAMADA',
    motivo: 'Pruebas de TakeOver de Base de Datos',
    durationMinutes: 30,
    durationSeconds: 1800
  },
  {
    id: 'mar-15',
    sistema: 'ACH',
    fecha: 'domingo, 8 de marzo de 2026',
    horaInicio: '6:48:00 a. m.',
    horaFin: '7:12:00 a. m.',
    tiempoServicioAbajo: '00:24:00',
    indicador: 'II-PROGRAMADA',
    motivo: 'Pruebas de TakeOver de Base de Datos',
    durationMinutes: 24,
    durationSeconds: 1440
  },
  {
    id: 'mar-16',
    sistema: 'ACH',
    fecha: 'domingo, 8 de marzo de 2026',
    horaInicio: '6:51:00 a. m.',
    horaFin: '7:08:00 a. m.',
    tiempoServicioAbajo: '00:17:00',
    indicador: 'II-PROGRAMADA',
    motivo: 'Pruebas de TakeOver de Base de Datos',
    durationMinutes: 17,
    durationSeconds: 1020
  },
  {
    id: 'mar-17',
    sistema: 'ACH',
    fecha: 'martes, 10 de marzo de 2026',
    horaInicio: '12:14:00 a. m.',
    horaFin: '12:30:00 a. m.',
    tiempoServicioAbajo: '00:16:00',
    indicador: 'II-PROGRAMADA',
    motivo: 'Ajustes mejoras ACH (estabilización)',
    durationMinutes: 16,
    durationSeconds: 960
  },
  {
    id: 'mar-18',
    sistema: 'ACH',
    fecha: 'sábado, 14 de marzo de 2026',
    horaInicio: '9:26:00 p. m.',
    horaFin: '10:16:00 p. m.',
    tiempoServicioAbajo: '00:50:00',
    indicador: 'II-FALLAS',
    motivo: 'Estabilización nuevo Sistema Core (Ajustes)',
    durationMinutes: 50,
    durationSeconds: 3000
  },
  {
    id: 'mar-19',
    sistema: 'ACH',
    fecha: 'lunes, 16 de marzo de 2026',
    horaInicio: '11:01:00 p. m.',
    horaFin: '11:41:00 p. m.',
    tiempoServicioAbajo: '00:40:00',
    indicador: 'II-FALLAS',
    motivo: 'Estabilización nuevo Sistema Core (Ajustes)',
    durationMinutes: 40,
    durationSeconds: 2400
  },
  {
    id: 'mar-20',
    sistema: 'ACH',
    fecha: 'sábado, 21 de marzo de 2026',
    horaInicio: '3:53:00 p. m.',
    horaFin: '4:40:00 p. m.',
    tiempoServicioAbajo: '00:47:00',
    indicador: 'II-FALLAS',
    motivo: 'Estabilización nuevo Sistema Core (Ajustes)',
    durationMinutes: 47,
    durationSeconds: 2820
  },
  {
    id: 'mar-21',
    sistema: 'ACH',
    fecha: 'miércoles, 25 de marzo de 2026',
    horaInicio: '11:05:00 p. m.',
    horaFin: '11:59:00 p. m.',
    tiempoServicioAbajo: '00:54:00',
    indicador: 'II-PROGRAMADA',
    motivo: 'Mantenimiento y Reinicio servicios por evento contención T24',
    durationMinutes: 54,
    durationSeconds: 3240
  },
  {
    id: 'mar-22',
    sistema: 'ACH',
    fecha: 'domingo, 29 de marzo de 2026',
    horaInicio: '3:45:00 a. m.',
    horaFin: '4:59:00 a. m.',
    tiempoServicioAbajo: '01:14:00',
    indicador: 'II-PROGRAMADA',
    motivo: 'Ajustes y mejoras FISA y ACH (estabilización)',
    durationMinutes: 74,
    durationSeconds: 4440
  },
  // POSTILION
  {
    id: 'mar-23',
    sistema: 'POSTILION',
    fecha: 'miércoles, 4 de marzo de 2026',
    horaInicio: '1:13:00 p. m.',
    horaFin: '1:42:00 p. m.',
    tiempoServicioAbajo: '00:29:00',
    indicador: 'II-FALLAS',
    motivo: 'Estabilización nuevo Sistema Core (Ajustes)',
    durationMinutes: 29,
    durationSeconds: 1740
  },
  {
    id: 'mar-24',
    sistema: 'POSTILION',
    fecha: 'sábado, 7 de marzo de 2026',
    horaInicio: '5:34:00 a. m.',
    horaFin: '5:56:00 a. m.',
    tiempoServicioAbajo: '00:22:00',
    indicador: 'II-FALLAS',
    motivo: 'Estabilización nuevo Sistema Core (Ajustes)',
    durationMinutes: 22,
    durationSeconds: 1320
  },
  {
    id: 'mar-25',
    sistema: 'POSTILION',
    fecha: 'domingo, 8 de marzo de 2026',
    horaInicio: '5:10:00 a. m.',
    horaFin: '5:56:00 a. m.',
    tiempoServicioAbajo: '00:46:00',
    indicador: 'II-PROGRAMADA',
    motivo: 'Pruebas de TakeOver de Base de Datos',
    durationMinutes: 46,
    durationSeconds: 2760
  },
  {
    id: 'mar-26',
    sistema: 'POSTILION',
    fecha: 'lunes, 9 de marzo de 2026',
    horaInicio: '5:29:00 a. m.',
    horaFin: '5:56:00 a. m.',
    tiempoServicioAbajo: '00:27:00',
    indicador: 'II-PROGRAMADA',
    motivo: 'Ajustes y mejoras OSB - T24 (estabilización)',
    durationMinutes: 27,
    durationSeconds: 1620
  },
  {
    id: 'mar-27',
    sistema: 'POSTILION',
    fecha: 'martes, 10 de marzo de 2026',
    horaInicio: '4:45:00 p. m.',
    horaFin: '5:10:00 p. m.',
    tiempoServicioAbajo: '00:25:00',
    indicador: 'II-FALLAS',
    motivo: 'Estabilización nuevo Sistema Core (Ajustes)',
    durationMinutes: 25,
    durationSeconds: 1500
  }
]

