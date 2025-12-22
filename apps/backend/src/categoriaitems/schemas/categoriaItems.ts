import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Definir la interfaz de los ítems
export interface IItem extends mongoose.Document {
    descripcion: string;
    valor: number;
}

// Interfaz para CategoriaItem que incluye el arreglo de ítems con descripción y valor
export interface ICategoriaItem extends mongoose.Document {
    descripcion: string;
    items: IItem[];  // Arreglo de ítems dentro de cada categoría
}

// Crear el esquema para los ítems (referencia al modelo Item)
const CategoriaItemSchema = new Schema<ICategoriaItem>({
    descripcion: { type: String, required: true },
    items: [{
        _id: { type: Schema.Types.ObjectId, ref: 'Item' },  // Referencia al modelo Item
        descripcion: { type: String, required: true },      // Descripción del ítem
        valor: { type: Number, required: true }             // Valor del ítem
    }]
});

// Crear y exportar el modelo de Mongoose para CategoriaItem
export const CategoriaItemModel = mongoose.model<ICategoriaItem>('CategoriaItem', CategoriaItemSchema, 'categoriaitems');
