/**
 * @param {string} id
 * @param {string} name
 * @param {string} streamURL
 * @param {string} location
 * @param {string} status
 * @param {string} createdBy
 */
class Camera {
    constructor(id: string, name: string, streamURL: string, location: string, status: string, createdBy: string) {
        this.id = id;
        this.name = name;
        this.streamURL = streamURL;
        this.location = location;
        this.status = status;
        this.createdBy = createdBy;
    }
}

module.exports = { Camera };
