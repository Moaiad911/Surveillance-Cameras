const EventModel = require('./models/EventModel');

const WHATSAPP_DAEMON_URL = process.env.WHATSAPP_DAEMON_URL || 'http://localhost:5050';

const generateWeeklyReport = async () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const events = await EventModel.find({
        createdAt: { $gte: weekAgo, $lte: now },
    }).populate('cameraId', 'name');

    const totalIncidents = events.length;

    // أكتر ساعة فيها حوادث
    const hourCounts = {};
    events.forEach((e) => {
        const hour = new Date(e.createdAt).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    let busiestHour = null;
    let maxHourCount = 0;
    for (const [hour, count] of Object.entries(hourCounts)) {
        if (count > maxHourCount) {
            maxHourCount = count;
            busiestHour = hour;
        }
    }

    // أكتر كاميرا نشاطاً
    const cameraCounts = {};
    events.forEach((e) => {
        const camName = e.cameraId?.name || e.camera || 'Unknown';
        cameraCounts[camName] = (cameraCounts[camName] || 0) + 1;
    });
    let busiestCamera = null;
    let maxCameraCount = 0;
    for (const [cam, count] of Object.entries(cameraCounts)) {
        if (count > maxCameraCount) {
            maxCameraCount = count;
            busiestCamera = cam;
        }
    }

    const highSeverity = events.filter((e) => e.severity === 'high').length;

    return {
        totalIncidents,
        busiestHour: busiestHour !== null ? `${busiestHour}:00 - ${parseInt(busiestHour) + 1}:00` : 'N/A',
        busiestHourCount: maxHourCount,
        busiestCamera: busiestCamera || 'N/A',
        busiestCameraCount: maxCameraCount,
        highSeverity,
        periodStart: weekAgo,
        periodEnd: now,
    };
};

const formatReportMessage = (report) => {
    const fmt = (d) => d.toLocaleDateString('en-GB');
    return `📊 *التقرير الأسبوعي - كاميرات المراقبة*\n` +
        `📅 من ${fmt(report.periodStart)} إلى ${fmt(report.periodEnd)}\n\n` +
        `🔢 إجمالي الحوادث: ${report.totalIncidents}\n` +
        `🔴 حوادث عالية الخطورة: ${report.highSeverity}\n` +
        `⏰ أكتر وقت نشاطاً: ${report.busiestHour} (${report.busiestHourCount} حادثة)\n` +
        `📹 أكتر كاميرا نشاطاً: ${report.busiestCamera} (${report.busiestCameraCount} حادثة)\n\n`;
};

const sendWeeklyReport = async (phoneNumber) => {
    const report = await generateWeeklyReport();
    const message = formatReportMessage(report);

    try {
        const resp = await fetch(`${WHATSAPP_DAEMON_URL}/send-text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber, message }),
        });
        const json = await resp.json();
        return { sent: !!json.sent, report };
    } catch (err) {
        console.error('[Weekly Report] Failed to send:', err.message);
        return { sent: false, error: err.message, report };
    }
};

module.exports = { generateWeeklyReport, sendWeeklyReport };
