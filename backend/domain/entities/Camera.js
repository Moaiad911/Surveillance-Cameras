class Camera {
    constructor({ id, name, model, ipAddress, streamURL, location, resolution, frameRate, recording, status, createdBy, createdAt, updatedAt }) {
        this.id = id;
        this.name = name;
        this.model = model;
        this.ipAddress = ipAddress;
        this.streamURL = streamURL;
        this.location = location;
        this.resolution = resolution;
        this.frameRate = frameRate;
        this.recording = recording;
        this.status = status;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

module.exports = Camera;
