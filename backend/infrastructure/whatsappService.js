const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

let client = null;
let isReady = false;

const initWhatsApp = () => {
    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: { args: ['--no-sandbox'] }
    });

    client.on('qr', (qr) => {
        console.log('\n📱 Scan this QR code with WhatsApp:');
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        isReady = true;
        console.log('✅ WhatsApp connected!');
    });

    client.on('disconnected', () => {
        isReady = false;
        console.log('❌ WhatsApp disconnected');
    });

    console.log('[WhatsApp] Launching Puppeteer/Chrome...');
    client.initialize().catch((err) => {
        console.error('[WhatsApp] Initialize FAILED:', err.message);
        console.error(err.stack);
    });
};

const sendAlert = async (phoneNumber, message) => {
    if (!isReady || !client) {
        console.log('[WhatsApp] Not ready, skipping alert');
        return false;
    }
    try {
        const chatId = phoneNumber.replace(/\+/g, '') + '@c.us';
        await client.sendMessage(chatId, message);
        console.log(`[WhatsApp] Alert sent to ${phoneNumber}`);
        return true;
    } catch (err) {
        console.error('[WhatsApp] Send error:', err.message);
        return false;
    }
};

const sendAnomalyAlert = async (phoneNumber, data) => {
    const message = `🚨 *تحذير أمني - ${data.type}*\n\n` +
        `📹 الكاميرا: ${data.cameraName}\n` +
        `⚠️ النوع: ${data.predictedClass}\n` +
        `📊 درجة الخطورة: ${(data.anomalyScore * 100).toFixed(0)}%\n` +
        `🕐 الوقت: ${new Date().toLocaleString('ar-EG')}\n\n` +
        `افتح التطبيق لمشاهدة التفاصيل`;
    
    return await sendAlert(phoneNumber, message);
};

const sendMediaAlert = async (phoneNumber, filePath, caption) => {
    if (!isReady || !client) {
        console.log('[WhatsApp] Not ready, skipping media alert');
        return false;
    }
    try {
        const chatId = phoneNumber.replace(/\+/g, '') + '@c.us';
        const media = MessageMedia.fromFilePath(filePath);
        await client.sendMessage(chatId, media, { caption });
        console.log(`[WhatsApp] Media alert sent to ${phoneNumber}`);
        return true;
    } catch (err) {
        console.error('[WhatsApp] Media send error:', err.message);
        return false;
    }
};

module.exports = { initWhatsApp, sendAlert, sendAnomalyAlert, sendMediaAlert, isReady: () => isReady };
