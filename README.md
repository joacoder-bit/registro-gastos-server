# Servidor de Registro de Gastos + Mercado Pago

Este servidor tiene dos trabajos:

1. **`api/webhook.js`** — Mercado Pago le avisa acá cada vez que te llega un pago o transferencia.
   El servidor busca los detalles de ese movimiento y lo guarda en Supabase.

2. **`api/expenses.js`** — Es la puerta de entrada que usa tu app para leer todos los gastos
   (los automáticos de Mercado Pago + los que cargues a mano), y también para agregar o borrar gastos manuales.

## Variables de entorno necesarias

Configuralas en Vercel (Settings → Environment Variables):

- `MP_ACCESS_TOKEN` → el Access Token de producción de Mercado Pago.
- `SUPABASE_URL` → la Project URL de Supabase (ej: `https://sscwaunuqqgtvmjmhbrs.supabase.co`).
- `SUPABASE_SERVICE_ROLE_KEY` → la clave secreta de Supabase (la de "API Keys" / secret key).

Nunca subas estos valores directamente al código ni a GitHub.
