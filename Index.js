// Minimal WhatsApp Cloud API bot (Express)
// Env: VERIFY_TOKEN, WHATSAPP_TOKEN, PHONE_NUMBER_ID, PORT

require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const API_BASE = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}`;

app.get('/webhook', (req, res) => {
  // Webhook verification (Hub Challenge)
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    // Pastikan struktur pesan sesuai dokumentasi WhatsApp Cloud API
    if (body.object && body.entry && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        if (!entry.changes) continue;
        for (const change of entry.changes) {
          const value = change.value;
          if (!value.messages) continue;
          for (const message of value.messages) {
            const from = message.from; // pengirim
            const msgBody = (message.text && message.text.body) || '';
            console.log(`Pesan dari ${from}: ${msgBody}`);

            // Contoh: balas dengan echo + teks sederhana
            const replyText = `Terima kasih! Kamu menulis: "${msgBody}"`;

            await axios.post(`${API_BASE}/messages`, {
              messaging_product: "whatsapp",
              to: from,
              text: { body: replyText }
            }, {
              headers: {
                Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
              }
            }).catch(err => {
              console.error('Gagal mengirim balasan:', err?.response?.data || err.message);
            });
          }
        }
      }
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen
