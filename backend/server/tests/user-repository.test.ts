
// ai coded
import { UserRepository } from '../src/models/user/user-repository';
import { DB } from '../src/db/database';

describe('UserRepository', () => {
    beforeAll(() => {
        process.env.NODE_ENV = 'test';
    });

    afterAll(() => {
        DB.closeConnection();
    });

    it('should create a new user and find them by email', () => {
        const userData = {
            email: 'test@example.com',
            password_hash: 'hashed_password',
            role: 'user'
        };

        const userId = UserRepository.create(userData);
        expect(userId).toBeDefined();
        expect(typeof userId).toBe('number');

        const user = UserRepository.findByEmail('test@example.com');
        expect(user).toBeDefined();
        expect(user?.email).toBe(userData.email);
        expect(user?.password_hash).toBe(userData.password_hash);
    });

    it('should return undefined for non-existent email', () => {
        const user = UserRepository.findByEmail('nonexistent@example.com');
        expect(user).toBeUndefined();
    });
});
