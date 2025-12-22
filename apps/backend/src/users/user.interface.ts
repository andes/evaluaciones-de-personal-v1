import { Document } from 'mongoose';

export interface IUser extends Document {
    dni: string;
    password: string;
    nombre: string;
    email: string;
    rol: string;
    comparePassword(passwordAttempt: string): Promise<boolean>;
}
