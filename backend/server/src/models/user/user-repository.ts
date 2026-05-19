import { DB } from "../../db/database";

export interface User {
    user_id?: number;
    email: string;
    password_hash: string;
    role?: string;
    image?: string;
}

export class UserRepository {
    private static get db() {
        return DB.getConnection();
    }

    public static findByEmail(email: string): User | undefined {
        const user = this.db.prepare("SELECT user_id, email, password_hash, role, image FROM users WHERE email = ?").get(email) as User | undefined;
        return user;
    }

    public static create(user: User): number {
        const result = this.db.prepare("INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)")
            .run(user.email, user.password_hash, user.role || 'user');
        return result.lastInsertRowid as number;
    }

    public static updateImage(userId: number, image: string): boolean {
        const result = this.db.prepare("UPDATE users SET image = ? WHERE user_id = ?")
            .run(image, userId);
        return result.changes > 0;
    }
}
