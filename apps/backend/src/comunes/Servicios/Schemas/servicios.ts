import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface IServicio extends mongoose.Document {
    descripcion: string;
}

const ServicioSchema = new Schema<IServicio>({
    descripcion: { type: String, required: true }
});

export const ServicioModel = mongoose.model<IServicio>('Servicios', ServicioSchema, 'servicios');

export { ServicioSchema };
