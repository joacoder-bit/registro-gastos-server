// api/expenses.js
// Esta es la puerta de entrada que va a usar tu app (la del navegador) para
// leer y agregar gastos, en vez de guardarlos solo localmente.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Permite que tu app (desde cualquier origen) pueda llamar a este servidor
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { date, amount, description, category } = req.body || {};
    if (!date || !amount || !description || !category) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert({ date, amount, description, category, source: 'manual' })
      .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  if (req.method === 'DELETE') {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'Falta el id' });

    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ deleted: true });
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
