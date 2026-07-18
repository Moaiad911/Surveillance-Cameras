const express = require('express');
const { initWhatsApp, sendAlert, sendAnomalyAlert, sendMediaAlert, isReady } = require('./infrastructure/whatsappService');

const app = express();
app.use(express.json());

const PORT = process.env.WHATSAPP_DAEMON_PORT || 5050;

app.post('/send-text', async (req, res) => {
    try {
        const { phoneNumber, message } = req.body;
        const sent = await sendAlert(phoneNumber, message);
        res.status(200).json({ sent });
    } catch (err) {
        res.status(500).json({ sent: false, error: err.message });
    }
});

app.post('/send-alert', async (req, res) => {
    try {
        const { phoneNumber, data } = req.body;
        const sent = await sendAnomalyAlert(phoneNumber, data);
        res.status(200).json({ sent });
    } catch (err) {
        res.status(500).json({ sent: false, error: err.message });
    }
});

app.post('/send-media', async (req, res) => {
    try {
        const { phoneNumber, filePath, caption } = req.body;
        const sent = await sendMediaAlert(phoneNumber, filePath, caption);
        res.status(200).json({ sent });
    } catch (err) {
        res.status(500).json({ sent: false, error: err.message });
    }
});

app.get('/status', (req, res) => {
    res.status(200).json({ ready: isReady() });
});

app.listen(PORT, () => {
    console.log(`[WhatsApp Daemon] Listening on port ${PORT}`);
    initWhatsApp();
});
