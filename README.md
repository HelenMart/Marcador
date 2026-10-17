# MatchLive — Football Control Center

Aplicación de fútbol en vivo con **TypeScript, React, Express, SQLite, Drizzle ORM y Server-Sent Events**. Vista pública y administrativa; dos partidos; goles, faltas y cambios; marcador persistente.

## Requisitos

Node.js 20+ y npm. No requiere instalar PostgreSQL ni Docker.

## Instalación (Windows CMD / PowerShell)

```bash
npm install
npm run install:all
npm run db:migrate
npm run db:seed
npm run dev
```

Abrir **http://localhost:5173**. API en **http://localhost:3001**. Seleccionar Administración para registrar eventos. Para demostrar SSE, abrir otra pestaña en Centro en vivo y seleccionar el mismo partido.

## Migraciones versionadas

- `backend/migrations/0001_initial.sql`: tablas `matches` y `events`.
- `backend/migrations/0002_add_player.sql`: columna `player` e índice de ordenación.

Ejecutar `npm run db:migrate` desde la raíz. El ejecutor `backend/scripts/migrate.ts` aplica en orden cada migración SQL dentro de una transacción y guarda su versión en `schema_migrations`; nunca reaplica migraciones existentes. **No se modifica manualmente la base de datos**. El esquema ORM está en `backend/src/schema.ts`. Para generar propuestas de migración Drizzle adicionales: `cd backend && npm run db:generate` (se crean en `drizzle-generated/`; para el flujo versionado de esta entrega se usan las dos migraciones SQL anteriores). 

## Comandos

- `npm run dev`: frontend + backend.
- `npm run typecheck`: revisión de tipos.
- `npm run build`: compilación.
- `npm run db:migrate`: aplicar migraciones.
- `npm run db:seed`: insertar dos partidos, sin duplicarlos.

## API

- `GET /api/matches`: lista de partidos.
- `GET /api/matches/:id`: estado actual y eventos ordenados por minuto, fecha e ID.
- `GET /api/matches/:id/events/stream`: SSE (`text/event-stream`) aislado por partido.
- `POST /api/matches/:id/events`: validación Zod, transacción de inserción y actualización del marcador, transmisión **después** de guardar.

## SSE y recuperación

El navegador primero carga por HTTP el estado y la línea de tiempo, luego abre `EventSource`. Se cierra la conexión al cambiar de partido o desmontar el componente. El servidor envía solo a suscriptores del ID correspondiente. El frontend evita duplicados por ID y sincroniza el historial tras conectar. `EventSource` reconecta automáticamente si se interrumpe la conexión. No hay polling periódico.

## Evidencias para Canvas

1. Vista pública con dos partidos.
2. Administración con partido seleccionado y un evento registrado.
3. DevTools → Network → `stream` (EventStream), `Content-Type: text/event-stream` y evento `update` recibido.
4. Carpeta `backend/migrations` con ambos SQL y terminal mostrando `npm run db:migrate`.
5. Marcador y eventos antes y después de recargar F5.
6. Registrar un evento en partido 1 y comprobar que no aparece en partido 2.

Incluye URL del repositorio público en Canvas y una breve descripción debajo de cada captura.

## Variables de entorno

Copiar `.env.example` si se necesitan cambios. Los valores por defecto funcionan en local. No subir `.env` ni archivos `.db`.

## Nota de alcance

Proyecto educativo sin autenticación administrativa. El modo Administración se ofrece para demostración local.
