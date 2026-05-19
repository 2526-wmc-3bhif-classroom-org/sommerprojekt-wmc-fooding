import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserRepository, User } from "./user-repository";

const getSecretKey = () => (process.env.JWT_SECRET || 'fallback-key').trim();

export class UserService {
    public static async login(email: string, password: string): Promise<{ success: boolean; user?: any; token?: string; message?: string }> {
        try {
            const user = UserRepository.findByEmail(email);
            if (!user) {
                return { success: false, message: 'Benutzer existiert nicht' };
            }

            const passwordMatch = bcrypt.compareSync(password, user.password_hash);
            if (!passwordMatch) {
                return { success: false, message: 'Falsches Passwort' };
            }

            const userClaims = {
                email: user.email,
                id: user.user_id,
                role: user.role || 'user',
                image: user.image
            };

            const token = jwt.sign({ user: userClaims }, getSecretKey(), { expiresIn: '7d' });

            return { success: true, user: userClaims, token };
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, message: "Login fehlgeschlagen" };
        }
    }

    public static async register(email: string, password: string): Promise<{ success: boolean; user?: any; token?: string; message?: string }> {
        if (!email || !password) {
            return { success: false, message: 'Email und Passwort erforderlich' };
        }

        try {
            const existingUser = UserRepository.findByEmail(email);
            if (existingUser) {
                return { success: false, message: 'Email bereits registriert' };
            }

            const password_hash = bcrypt.hashSync(password, 10);
            const userId = UserRepository.create({ email, password_hash });

            const userClaims = {
                email: email,
                id: userId,
                role: 'user',
                image: null
            };

            const token = jwt.sign({ user: userClaims }, getSecretKey(), { expiresIn: '7d' });

            return { success: true, user: userClaims, token };
        } catch (error) {
            console.error("Registration error:", error);
            return { success: false, message: "Registrierung fehlgeschlagen" };
        }
    }

    public static updateProfileImage(userId: number, imagePath: string): { success: boolean; message?: string } {
        try {
            const success = UserRepository.updateImage(userId, imagePath);
            if (!success) {
                return { success: false, message: "Benutzer nicht gefunden" };
            }
            return { success: true };
        } catch (error) {
            console.error("Error updating profile image:", error);
            return { success: false, message: "Fehler beim Aktualisieren des Profilbildes" };
        }
    }

    public static getUserById(email: string): User | undefined {
        return UserRepository.findByEmail(email);
    }
}
