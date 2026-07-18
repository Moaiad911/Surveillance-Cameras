
// في _saveEvent، بعت WhatsApp alert
const _sendWhatsAppAlert = async (cameraId, result) => {
    try {
        const { sendAnomalyAlert } = require('./whatsappService');
        const CameraModel = require('../infrastructure/models/CameraModel');
        const camera = await CameraModel.findById(cameraId);
        
        const alertPhone = process.env.ALERT_PHONE_NUMBER;
        if (!alertPhone) return;

        await sendAnomalyAlert(alertPhone, {
            type: result.predicted_class,
            cameraName: camera?.name || 'Unknown',
            predictedClass: result.predicted_class,
            anomalyScore: result.anomaly_score,
        });
    } catch (err) {
        console.error('[WhatsApp Alert] Error:', err.message);
    }
};
