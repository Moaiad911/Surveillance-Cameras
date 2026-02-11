export class User {
    constructor(
        public id: string,
        public username: string,
        public passwordHash: string,
        public role: 'Admin' | 'Operator',
        public createdAt?: Date,
        public updatedAt?: Date
    ) {}
}
