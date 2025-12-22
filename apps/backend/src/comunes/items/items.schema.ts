import * as mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
    descripcion: { type: String, required: true },
    valor: { type: Number, required: true }
});

// Modelo acorde al archivo: ItemModel
export const ItemModel = mongoose.model('Item', ItemSchema, 'edItems');
