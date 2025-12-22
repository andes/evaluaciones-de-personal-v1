import { Router } from 'express';
import { ItemModel } from './items.schema';

const router = Router();

/**
 * GET /rEvaDesemp
 * Obtiene todos los ítems
 */
router.get('/rEvaDesemp', async (req, res) => {
    try {
        const data = await ItemModel.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los ítems' });
    }
});

/**
 * GET /rEvaDesemp/:id
 * Obtiene un ítem por ID
 */
router.get('/rEvaDesemp/:id', async (req, res) => {
    try {
        const item = await ItemModel.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ error: 'Ítem no encontrado' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el ítem' });
    }
});

/**
 * POST /rEvaDesemp
 * Crea uno o varios ítems
 */
router.post('/rEvaDesemp', async (req, res) => {
    try {
        if (Array.isArray(req.body)) {
            const items = await ItemModel.insertMany(req.body);
            return res.json(items);
        }

        const item = await ItemModel.create(req.body);
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el ítem' });
    }
});

/**
 * PUT /rEvaDesemp/:id
 * Actualiza totalmente un ítem
 */
router.put('/rEvaDesemp/:id', async (req, res) => {
    try {
        const updated = await ItemModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // Devuelve el documento actualizado
        );

        if (!updated) {
            return res.status(404).json({ error: 'Ítem no encontrado para actualizar' });
        }

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el ítem' });
    }
});

/**
 * DELETE /rEvaDesemp/:id
 * Elimina un ítem por ID
 */
router.delete('/rEvaDesemp/:id', async (req, res) => {
    try {
        const deleted = await ItemModel.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ error: 'Ítem no encontrado' });
        }

        res.json({ message: 'Ítem eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el ítem' });
    }
});

export default router;
