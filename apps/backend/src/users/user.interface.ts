import { Document, Types } from 'mongoose';

export interface IUser extends Document {
    dni: string;
    password: string;
    nombre: string;
    email: string;
    rol: string;
    servicios: {
        idServicio: Types.ObjectId;
        descripcion: string;
    }[];
    comparePassword(passwordAttempt: string): Promise<boolean>;
}