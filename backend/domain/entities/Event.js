class Event {
    constructor({ id, type, camera, cameraId, severity, acknowledged, createdAt }) {
        this.id = id;
        this.type = type;
        this.camera = camera;
        this.cameraId = cameraId;
        this.severity = severity;
        this.acknowledged = acknowledged;
        this.createdAt = createdAt;
    }
}

module.exports = Event;
