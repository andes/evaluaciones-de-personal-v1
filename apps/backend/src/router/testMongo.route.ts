import { Router, Request, Response } from 'express';
import TestModel from '../models/test.models';

const router = Router();

// Guardar un documento de prueba
router.post('/add', async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const newTest = new TestModel({ name });
        const saved = await newTest.save();
        res.json({ message: 'Documento guardado ', data: saved });
    } catch (err) {
        res.status(500).json({ message: 'Error al guardar', error: err });
    }
});

// Listar todos los documentos
router.get('/all', async (_req: Request, res: Response) => {
    try {
        const docs = await TestModel.find();
        res.json({ message: 'Documentos encontrados ', data: docs });
    } catch (err) {
        res.status(500).json({ message: 'Error al leer documentos', error: err });
    }
});

export default router;
