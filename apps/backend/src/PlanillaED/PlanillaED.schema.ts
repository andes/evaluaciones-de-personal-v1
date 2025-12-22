import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Interfaz para el tipo de evaluación
interface TipoEvaluacion {
    idTipoEvaluacion: mongoose.Types.ObjectId;
    nombre: string;
}

export interface IPlanillaED extends mongoose.Document {
    fechaCreacion: Date;
    idEfector: mongoose.Schema.Types.ObjectId;
    descripcion: string;
    idServicio: mongoose.Schema.Types.ObjectId;
    tipoEvaluacion: TipoEvaluacion;
    categorias: {
        descripcion: string;
        categoria: mongoose.Schema.Types.ObjectId;
        items: {
            _id: string;
            descripcion: string;
            valor: number;
        }[];
    }[];
}

// Esquema de categoría
const CategoriaSchema = new Schema({
    categoria: { type: Schema.Types.ObjectId, ref: 'CategoriaItem', required: true },
    descripcion: { type: String, required: true },
    items: [{
        _id: { type: Schema.Types.ObjectId, ref: 'Item' },
        descripcion: { type: String, required: true },
        valor: { type: Number, required: true }
    }]
});

const PlanillaEDSchema = new Schema({
    fechaCreacion: { type: Date, required: true },
    descripcion: { type: String, required: true },
    idEfector: { type: Schema.Types.ObjectId, ref: 'Efectores', required: false },
    idServicio: { type: Schema.Types.ObjectId, ref: 'Servicios', required: false },
    tipoEvaluacion: {
        idTipoEvaluacion: { type: Schema.Types.ObjectId, ref: 'TipoEvaluacion', required: true },
        nombre: { type: String, required: true }
    },
    categorias: [CategoriaSchema]
} as any);

export const PlanillaEDModel =
    mongoose.model<IPlanillaED>('PlanillaED', PlanillaEDSchema, 'planillaed');
