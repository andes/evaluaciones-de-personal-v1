import * as mongoose from 'mongoose';

const schema = new mongoose.Schema({
    nombre: { type: String, required: true }
});


export const modelo = mongoose.model('tipoCierreEvaluacion', schema, 'TipoCierreEvaluacion');

export interface ITipoCierreEvaluacion extends mongoose.Document {
    nombre: string;
}


const Schema = mongoose.Schema;

const TipoCierreEvaluacionSchema = new Schema<ITipoCierreEvaluacion>({
    nombre: { type: String, required: true }
});

export const TipoCierreEvaluacionModel = mongoose.model<ITipoCierreEvaluacion>('TipoCierreEvaluacion', TipoCierreEvaluacionSchema, 'TipoCierreEvaluacion');


export { TipoCierreEvaluacionSchema };