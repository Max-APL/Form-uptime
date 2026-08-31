import * as XLSX from 'xlsx'

const marzoEvents = [
  // T24 / CORE T24
  {
    "SISTEMA": "CORE T24",
    "FECHA": "miércoles, 25 de marzo de 2026",
    "HORA DE INICIO CAIDA": "10:31:00 p. m.",
    "HORA DE FIN CAIDA": "11:05:00 p. m.",
    "TIEMPO SERVICIO ABAJO": "00:34:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Contención BD"
  },
  // BANCA MOVIL
  {
    "SISTEMA": "BANCA MOVIL",
    "FECHA": "miércoles, 4 de marzo de 2026",
    "HORA DE INICIO CAIDA": "1:12:00 p. m.",
    "HORA DE FIN CAIDA": "1:36:00 p. m.",
    "TIEMPO SERVICIO ABAJO": "00:24:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Estabilización nuevo Sistema Core (Ajustes)"
  },
  {
    "SISTEMA": "BANCA MOVIL",
    "FECHA": "viernes, 6 de marzo de 2026",
    "HORA DE INICIO CAIDA": "5:46:00 p. m.",
    "HORA DE FIN CAIDA": "6:12:00 p. m.",
    "TIEMPO SERVICIO ABAJO": "00:26:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Estabilización nuevo Sistema Core (Ajustes)"
  },
  {
    "SISTEMA": "BANCA MOVIL",
    "FECHA": "jueves, 12 de marzo de 2026",
    "HORA DE INICIO CAIDA": "1:01:00 a. m.",
    "HORA DE FIN CAIDA": "1:13:00 a. m.",
    "TIEMPO SERVICIO ABAJO": "00:12:00",
    "INDICADOR": "II-PROGRAMADA",
    "MOTIVO": "Mantenimiento plataforma BM"
  },
  {
    "SISTEMA": "BANCA MOVIL",
    "FECHA": "martes, 17 de marzo de 2026",
    "HORA DE INICIO CAIDA": "2:12:00 a. m.",
    "HORA DE FIN CAIDA": "2:25:00 a. m.",
    "TIEMPO SERVICIO ABAJO": "00:13:00",
    "INDICADOR": "II-PROGRAMADA",
    "MOTIVO": "Mantenimiento plataforma BM"
  },
  {
    "SISTEMA": "BANCA MOVIL",
    "FECHA": "sábado, 21 de marzo de 2026",
    "HORA DE INICIO CAIDA": "3:58:00 p. m.",
    "HORA DE FIN CAIDA": "4:39:00 p. m.",
    "TIEMPO SERVICIO ABAJO": "00:41:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Estabilización nuevo Sistema Core (Ajustes)"
  },
  {
    "SISTEMA": "BANCA MOVIL",
    "FECHA": "domingo, 29 de marzo de 2026",
    "HORA DE INICIO CAIDA": "3:48:00 a. m.",
    "HORA DE FIN CAIDA": "4:26:00 a. m.",
    "TIEMPO SERVICIO ABAJO": "00:38:00",
    "INDICADOR": "II-PROGRAMADA",
    "MOTIVO": "Ajustes y mejoras OSB - T24 (estabilización)"
  },
  // ACH
  {
    "SISTEMA": "ACH",
    "FECHA": "martes, 3 de marzo de 2026",
    "HORA DE INICIO CAIDA": "3:05:00 p. m.",
    "HORA DE FIN CAIDA": "4:45:00 p. m.",
    "TIEMPO SERVICIO ABAJO": "01:40:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Estabilización nuevo Sistema Core (Ajustes)"
  },
  {
    "SISTEMA": "ACH",
    "FECHA": "martes, 3 de marzo de 2026",
    "HORA DE INICIO CAIDA": "5:10:00 p. m.",
    "HORA DE FIN CAIDA": "5:28:00 p. m.",
    "TIEMPO SERVICIO ABAJO": "00:18:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Estabilización nuevo Sistema Core (Ajustes)"
  },
  {
    "SISTEMA": "ACH",
    "FECHA": "miércoles, 4 de marzo de 2026",
    "HORA DE INICIO CAIDA": "12:39:00 p. m.",
    "HORA DE FIN CAIDA": "1:52:00 p. m.",
    "TIEMPO SERVICIO ABAJO": "01:13:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Estabilización nuevo Sistema Core (Ajustes)"
  },
  {
    "SISTEMA": "ACH",
    "FECHA": "viernes, 6 de marzo de 2026",
    "HORA DE INICIO CAIDA": "4:36:00 p. m.",
    "HORA DE FIN CAIDA": "6:38:00 p. m.",
    "TIEMPO SERVICIO ABAJO": "02:02:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Estabilización nuevo Sistema Core (Ajustes)"
  },
  {
    "SISTEMA": "ACH",
    "FECHA": "viernes, 6 de marzo de 2026",
    "HORA DE INICIO CAIDA": "4:39:00 p. m.",
    "HORA DE FIN CAIDA": "5:11:00 p. m.",
    "TIEMPO SERVICIO ABAJO": "00:32:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Estabilización nuevo Sistema Core (Ajustes)"
  },
  {
    "SISTEMA": "ACH",
    "FECHA": "viernes, 6 de marzo de 2026",
    "HORA DE INICIO CAIDA": "5:45:00 p. m.",
    "HORA DE FIN CAIDA": "6:13:00 p. m.",
    "TIEMPO SERVICIO ABAJO": "00:28:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Estabilización nuevo Sistema Core (Ajustes)"
  },
  {
    "SISTEMA": "ACH",
    "FECHA": "domingo, 8 de marzo de 2026",
    "HORA DE INICIO CAIDA": "4:09:00 a. m.",
    "HORA DE FIN CAIDA": "4:39:00 a. m.",
    "TIEMPO SERVICIO ABAJO": "00:30:00",
    "INDICADOR": "II-PROGRAMADA",
    "MOTIVO": "Pruebas de TakeOver de Base de Datos"
  },
  {
    "SISTEMA": "ACH",
    "FECHA": "domingo, 8 de marzo de 2026",
    "HORA DE INICIO CAIDA": "6:48:00 a. m.",
    "HORA DE FIN CAIDA": "7:12:00 a. m.",
    "TIEMPO SERVICIO ABAJO": "00:24:00",
    "INDICADOR": "II-PROGRAMADA",
    "MOTIVO": "Pruebas de TakeOver de Base de Datos"
  },
  {
    "SISTEMA": "ACH",
    "FECHA": "domingo, 8 de marzo de 2026",
    "HORA DE INICIO CAIDA": "6:51:00 a. m.",
    "HORA DE FIN CAIDA": "7:08:00 a. m.",
    "TIEMPO SERVICIO ABAJO": "00:17:00",
    "INDICADOR": "II-PROGRAMADA",
    "MOTIVO": "Pruebas de TakeOver de Base de Datos"
  },
  {
    "SISTEMA": "ACH",
    "FECHA": "martes, 10 de marzo de 2026",
    "HORA DE INICIO CAIDA": "12:14:00 a. m.",
    "HORA DE FIN CAIDA": "12:30:00 a. m.",
    "TIEMPO SERVICIO ABAJO": "00:16:00",
    "INDICADOR": "II-PROGRAMADA",
    "MOTIVO": "Ajustes mejoras ACH (estabilización)"
  },
  {
    "SISTEMA": "ACH",
    "FECHA": "sábado, 14 de marzo de 2026",
    "HORA DE INICIO CAIDA": "9:26:00 p. m.",
    "HORA DE FIN CAIDA": "10:16:00 p. m.",
    "TIEMPO SERVICIO ABAJO": "00:50:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Estabilización nuevo Sistema Core (Ajustes)"
  },
  {
    "SISTEMA": "ACH",
    "FECHA": "lunes, 16 de marzo de 2026",
    "HORA DE INICIO CAIDA": "11:01:00 p. m.",
    "HORA DE FIN CAIDA": "11:41:00 p. m.",
    "TIEMPO SERVICIO ABAJO": "00:40:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Estabilización nuevo Sistema Core (Ajustes)"
  },
  {
    "SISTEMA": "ACH",
    "FECHA": "sábado, 21 de marzo de 2026",
    "HORA DE INICIO CAIDA": "3:53:00 p. m.",
    "HORA DE FIN CAIDA": "4:40:00 p. m.",
    "TIEMPO SERVICIO ABAJO": "00:47:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Estabilización nuevo Sistema Core (Ajustes)"
  },
  {
    "SISTEMA": "ACH",
    "FECHA": "miércoles, 25 de marzo de 2026",
    "HORA DE INICIO CAIDA": "11:05:00 p. m.",
    "HORA DE FIN CAIDA": "11:59:00 p. m.",
    "TIEMPO SERVICIO ABAJO": "00:54:00",
    "INDICADOR": "II-PROGRAMADA",
    "MOTIVO": "Mantenimiento y Reinicio servicios por evento contención T24"
  },
  {
    "SISTEMA": "ACH",
    "FECHA": "domingo, 29 de marzo de 2026",
    "HORA DE INICIO CAIDA": "3:45:00 a. m.",
    "HORA DE FIN CAIDA": "4:59:00 a. m.",
    "TIEMPO SERVICIO ABAJO": "01:14:00",
    "INDICADOR": "II-PROGRAMADA",
    "MOTIVO": "Ajustes y mejoras FISA y ACH (estabilización)"
  },
  // POSTILION
  {
    "SISTEMA": "POSTILION",
    "FECHA": "miércoles, 4 de marzo de 2026",
    "HORA DE INICIO CAIDA": "1:13:00 p. m.",
    "HORA DE FIN CAIDA": "1:42:00 p. m.",
    "TIEMPO SERVICIO ABAJO": "00:29:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Estabilización nuevo Sistema Core (Ajustes)"
  },
  {
    "SISTEMA": "POSTILION",
    "FECHA": "sábado, 7 de marzo de 2026",
    "HORA DE INICIO CAIDA": "5:34:00 a. m.",
    "HORA DE FIN CAIDA": "5:56:00 a. m.",
    "TIEMPO SERVICIO ABAJO": "00:22:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Estabilización nuevo Sistema Core (Ajustes)"
  },
  {
    "SISTEMA": "POSTILION",
    "FECHA": "domingo, 8 de marzo de 2026",
    "HORA DE INICIO CAIDA": "5:10:00 a. m.",
    "HORA DE FIN CAIDA": "5:56:00 a. m.",
    "TIEMPO SERVICIO ABAJO": "00:46:00",
    "INDICADOR": "II-PROGRAMADA",
    "MOTIVO": "Pruebas de TakeOver de Base de Datos"
  },
  {
    "SISTEMA": "POSTILION",
    "FECHA": "lunes, 9 de marzo de 2026",
    "HORA DE INICIO CAIDA": "5:29:00 a. m.",
    "HORA DE FIN CAIDA": "5:56:00 a. m.",
    "TIEMPO SERVICIO ABAJO": "00:27:00",
    "INDICADOR": "II-PROGRAMADA",
    "MOTIVO": "Ajustes y mejoras OSB - T24 (estabilización)"
  },
  {
    "SISTEMA": "POSTILION",
    "FECHA": "martes, 10 de marzo de 2026",
    "HORA DE INICIO CAIDA": "4:45:00 p. m.",
    "HORA DE FIN CAIDA": "5:10:00 p. m.",
    "TIEMPO SERVICIO ABAJO": "00:25:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Estabilización nuevo Sistema Core (Ajustes)"
  }
]

const ws = XLSX.utils.json_to_sheet(marzoEvents)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, "Eventos Marzo")
XLSX.writeFile(wb, "eventos_marzo_2026.xlsx")
console.log("Archivo eventos_marzo_2026.xlsx creado exitosamente en la raíz con 23 incidentes.")
