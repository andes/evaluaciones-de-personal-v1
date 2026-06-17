import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface IRol extends mongoose.Document {
    nombre: string;
    descripcion?: string;
    activo: boolean;
}

const RolSchema = new Schema<IRol>(
    {
        nombre: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        descripcion: {
            type: String,
            default: ''
        },

        activo: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export const RolModel = mongoose.model<IRol>(
    'Roles',
    RolSchema,
    'roles'
);

export { RolSchema };