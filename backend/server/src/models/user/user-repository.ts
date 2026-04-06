import { DB } from "../../db/database";

export interface User {
    user_id?: number;
    email: string;
    password_hash: string;
    role?: string;
}

export class UserRepository {
    private static get db() {
        return DB.getConnection();
    }

    public static findByEmail(email: string): User | undefined {
        const user = this.db.prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined;
        return user;
    }

    public static create(user: User): number {
        const result = this.db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)")
            .run(user.email, user.password_hash);
        return result.lastInsertRowid as number;
    }
}
