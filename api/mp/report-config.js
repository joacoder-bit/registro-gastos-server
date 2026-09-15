export default async function handler(req, res) {
  const token = process.env.MP_ACCESS_TOKEN;

  const body = {
    file_name_prefix: 'registro-gastos',
    display_timezone: 'GMT-03',
    include_withdrawal_at_end: false,
    execute_after_withdrawal: false,
    scheduled: false,
    columns: [
      { key: 'DATE' },
      { key: 'SOURCE_ID' },
      { key: 'EXTERNAL_REFERENCE' },
      { key: 'RECORD_TYPE' },
      { key: 'DESCRIPTION' },
      { key: 'NET_CREDIT_AMOUNT' },
      { key: 'NET_DEBIT_AMOUNT' },
      { key: 'GROSS_AMOUNT' }
    ],
    report_translation: 'es'
  };

  try {
    let response = await fetch('https://api.mercadopago.com/v1/account/release_report/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    let data = await response.json();

    if (!response.ok) {
      response = await fetch('https://api.mercadopago.com/v1/account/release_report/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      data = await response.json();
    }

    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
