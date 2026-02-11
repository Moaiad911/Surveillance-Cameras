export class Camera {
    constructor(
        public id: string,
        public name: string,
        public streamURL: string,
        public location: string,
        public status: string,
        public createdBy: string
    ) {}
}
