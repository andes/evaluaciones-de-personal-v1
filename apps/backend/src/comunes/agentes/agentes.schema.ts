import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface IAgente extends mongoose.Document {
    legajo: string;
    dni: string;
    nombre: string;
}

const AgenteSchema = new Schema<IAgente>({
    legajo: { type: String, required: true, unique: true },
    dni: { type: String, required: true, unique: true },
    nombre: { type: String, required: true }
});

export const AgenteModel = mongoose.model<IAgente>('Agentes', AgenteSchema, 'agentes');

export { AgenteSchema };
