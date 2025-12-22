import { Router } from 'express';
import { TipoCierreEvaluacionModel } from './TipoCierreEvaluacion.schema';

const router = Router();

// GET: obtener todos los documentos
router.get('/', async (req, res) => {
    try {
        const data = await TipoCierreEvaluacionModel.find().sort({ nombre: 1 });
        res.json(data);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        res.status(500).json({ error: 'Error al obtener los datos' });
    }
});

// GET: obtener un documento por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await TipoCierreEvaluacionModel.findById(id);

        if (!data) {
            return res.status(404).json({ error: 'No se encontró el documento' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error al obtener el documento:', error);
        res.status(500).json({ error: 'Error al obtener el documento' });
    }
});

// POST: crear nuevo documento
router.post('/', async (req, res) => {
    try {
        const nuevo = await TipoCierreEvaluacionModel.create(req.body);
        res.status(201).json(nuevo);
    } catch (error) {
        console.error('Error al crear:', error);
        res.status(500).json({ error: 'Error al crear el documento' });
    }
});

// PUT: actualizar documento por ID
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const actualizado = await TipoCierreEvaluacionModel.findByIdAndUpdate(id, req.body, { new: true });

        if (!actualizado) {
            return res.status(404).json({ error: 'No se encontró el documento para actualizar' });
        }

        res.json(actualizado);
    } catch (error) {
        console.error('Error al actualizar:', error);
        res.status(500).json({ error: 'Error al actualizar el documento' });
    }
});

export default router;
