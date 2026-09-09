// api/webhook.js
// Mercado Pago llama a esta URL cada vez que hay un movimiento (pago o transferencia recibida).
// Este archivo: 1) recibe el aviso, 2) le pregunta a Mercado Pago los detalles del pago,
// 3) guarda ese movimiento en Supabase (si no estaba guardado ya).

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Mercado Pago espera una respuesta rápida (200 OK), así que respondemos
  // apenas confirmamos que recibimos el aviso, y procesamos después.
  if (req.method !== 'POST') {
    return res.status(200).send('ok');
  }

  try {
    const body = req.body || {};
    const topic = body.type || req.query.type;
    const paymentId = body.data?.id || req.query['data.id'];

    // Solo nos interesan los avisos de tipo "payment"
    if (topic !== 'payment' || !paymentId) {
      return res.status(200).send('ignorado');
    }

    // Preguntarle a Mercado Pago los detalles de ese pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
      }
    });

    if (!mpResponse.ok) {
      console.error('No se pudo consultar el pago en Mercado Pago', await mpResponse.text());
      return res.status(200).send('error consultando MP');
    }

    const payment = await mpResponse.json();

    // Solo guardamos movimientos ya aprobados (evita registrar intentos fallidos)
    if (payment.status !== 'approved') {
      return res.status(200).send('pago no aprobado, ignorado');
    }

    const description =
      payment.description ||
      payment.payer?.first_name ||
      'Transferencia recibida';

    const { error } = await supabase
      .from('expenses')
      .upsert(
        {
          payment_id: String(payment.id),
          date: (payment.date_approved || payment.date_created || new Date().toISOString()).slice(0, 10),
          amount: payment.transaction_amount,
          description: `Ingreso: ${description}`,
          category: 'Mercado Pago',
          source: 'mercadopago'
        },
        { onConflict: 'payment_id' }
      );

    if (error) {
      console.error('Error guardando en Supabase', error);
    }

    return res.status(200).send('ok');
  } catch (err) {
    console.error('Error inesperado en el webhook', err);
    // Igual respondemos 200 para que Mercado Pago no reintente en loop
    return res.status(200).send('error');
  }
}
