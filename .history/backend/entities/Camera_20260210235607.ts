export class Camera {
    constructor(
        public id: string,
        public name: string,
        public streamURL: string,
        public location: string,
        public status: 'Active' | 'Inactive',
        public createdBy: string
    ) {}
}