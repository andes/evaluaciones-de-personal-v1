
import * as mongoose from 'mongoose';



const Schema = mongoose.Schema;

export interface IEfector extends mongoose.Document {
    nombre: string;
}

const EfectorSchema = new Schema<IEfector>({
    nombre: { type: String, required: true }
});

export const EfectorModel = mongoose.model<IEfector>('Efectores', EfectorSchema, 'efectores');
export { EfectorSchema };

