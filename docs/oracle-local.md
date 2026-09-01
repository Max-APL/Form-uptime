# Oracle local

Requisitos: Node.js 20.19+ y Docker/OrbStack iniciado.
La imagen Oracle Free soporta Apple Silicon:
https://github.com/gvenzl/oci-oracle-free

Configura `.env` a partir de `.env.example`. El contenedor toma `ORACLE_PASSWORD`
para el usuario SYSTEM durante su primera inicialización. Conexión:
`127.0.0.1:1521/XEPDB1`.

```sh
npm install
npm run db:start
npm run db:init
npm run server
```

En otra terminal, ejecuta `npm run dev`.
La primera descarga e inicialización puede tardar varios minutos.
Comprueba http://localhost:3001/api/db-status para verificar la conexión.
`npm run db:query` consulta los eventos guardados.

Al cargar un Excel se insertan sus eventos automáticamente. El botón de guardado
los vuelve a insertar: no elimina duplicados. Los reportes se calculan con los
datos en memoria; la interfaz no recupera el histórico de Oracle.

`npm run db:stop` detiene la base sin borrar datos. El volumen persistente es
`form-events_oracle-data`. No ejecutes `docker compose down -v` si quieres
conservarlos. Cambiar `.env` no cambia la contraseña de una base ya creada.

Configuración de desarrollo local: no expongas la API en Internet.
