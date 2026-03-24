import { DB } from "../../db/database";

export interface User {
    user_id?: number;
    email: string;
    password_hash: string;
    role?: string;
}

export class UserRepository {
    public static findByEmail(email: string): User | undefined {
        const db = DB.createDBConnection();
        try {
            const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined;
            return user;
        } finally {
            db.close();
        }
    }

    public static create(user: User): number {
        const db = DB.createDBConnection();
        try {
            const result = db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)")
                .run(user.email, user.password_hash);
            return result.lastInsertRowid as number;
        } finally {
            db.close();
        }
    }
}
