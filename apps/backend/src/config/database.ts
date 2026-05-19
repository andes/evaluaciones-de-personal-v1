import mongoose from 'mongoose';

export async function connectDB() {
    try {

        await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/evaluaciones-de-personal', {
            autoIndex: true,
            serverSelectionTimeoutMS: 5000,
        });

        console.log('✅ Conectado a MongoDB => ', mongoose.connection.host + ':' + mongoose.connection.port + '/' + mongoose.connection.name);
    } catch (err) {
        console.error('❌ Error al conectar a MongoDB:', err);
        process.exit(1);
    }
}
