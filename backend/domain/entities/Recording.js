class Recording {
    constructor({ id, filename, originalName, path, size, cameraId, uploadedBy, createdAt }) {
        this.id = id;
        this.filename = filename;
        this.originalName = originalName;
        this.path = path;
        this.size = size;
        this.cameraId = cameraId;
        this.uploadedBy = uploadedBy;
        this.createdAt = createdAt;
    }
}

module.exports = Recording;
