import mongoose, { Schema, Document } from 'mongoose';

export interface ITest extends Document {
    name: string;
    createdAt: Date;
}

const TestSchema: Schema = new Schema({
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITest>('Test', TestSchema);
