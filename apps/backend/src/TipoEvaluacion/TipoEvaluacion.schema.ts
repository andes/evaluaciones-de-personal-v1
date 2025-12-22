import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface ITipoEvaluacion extends mongoose.Document {
    nombre: string;
    descripcion?: string;
}

const TipoEvaluacionSchema = new Schema<ITipoEvaluacion>({
    nombre: { type: String, required: true },
    descripcion: { type: String }
});

// 'TipoEvaluacion' es el nombre del modelo
// 'edTipoEvaluacion' es el nombre de la colección en la DB
export const TipoEvaluacionModel = mongoose.model<ITipoEvaluacion>('TipoEvaluacion', TipoEvaluacionSchema, 'edTipoEvaluacion');
export { TipoEvaluacionSchema };
