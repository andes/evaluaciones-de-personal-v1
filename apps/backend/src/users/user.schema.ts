import { Schema, model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { IUser } from './user.interface';

const UserSchema = new Schema<IUser>({

    dni: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    nombre: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    rol: {
        type: String,
        required: true,
        trim: true
    },

    servicios: [
        {
            idServicio: {
                type: Schema.Types.ObjectId,
                required: true
            },

            descripcion: {
                type: String,
                required: true,
                trim: true
            }
        }
    ]

}, {
    timestamps: true
});


// HASH PASSWORD
UserSchema.pre<IUser>('save', async function (next) {

    if (!this.isModified('password')) {
        return next();
    }

    try {

        const salt = await bcrypt.genSalt(10);

        this.password = await bcrypt.hash(this.password, salt);

        next();

    } catch (error) {

        next(error as any);

    }

});


// COMPARE PASSWORD
UserSchema.methods.comparePassword = async function (
    password: string
): Promise<boolean> {

    return bcrypt.compare(password, this.password);

};


export const User = model<IUser>('User', UserSchema);