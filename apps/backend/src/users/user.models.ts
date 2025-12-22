import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interfaz para definir la estructura del usuario
export interface IUser extends Document {
    dni: string;
    password: string;
    nombre: string;
    rol: string;

    comparePassword: (password: string) => Promise<boolean>;
}

// Definir el esquema de Mongoose
const UserSchema = new Schema<IUser>({
    dni: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    nombre: { type: String, required: true, trim: true },
    rol: { type: String, required: true, trim: true },
});

// Middleware para hashear la contraseña antes de guardar
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as any);
    }
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (
    this: IUser,
    password: string
): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

// Exportar el modelo
export default model<IUser>('User', UserSchema);
