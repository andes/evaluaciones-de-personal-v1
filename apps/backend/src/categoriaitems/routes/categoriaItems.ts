import { Router } from 'express';
import { CategoriaItemModel as modelo } from '../schemas/categoriaItems';

const router = Router();

/**
 * GET /rmCategoriaItems
 * Devuelve todas las categorías ordenadas por descripción (asc).
 */
router.get('/rmCategoriaItems', async (req, res, next) => {
    try {
        const data = await modelo.find().sort({ descripcion: 1 });
        res.json(data);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /rmCategoriaItems/:id
 * Devuelve la categoría cuyo _id coincida con el parámetro.
 */
router.get('/rmCategoriaItems/:id', async (req, res) => {
    try {
        const doc = await modelo.findById(req.params.id);
        if (!doc) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }
        res.json(doc);
    } catch (error) {
        res.status(500).json({ error: 'Ha ocurrido un error' });
    }
});

/**
 * GET /rmCategoriaItems/verificar-descripcion/:descripcion
 * Devuelve true si no existe ninguna categoría con esa descripción.
 */
router.get('/rmCategoriaItems/verificar-descripcion/:descripcion', async (req, res) => {
    try {
        const desc = req.params.descripcion;
        const existe = await modelo.findOne({ descripcion: desc });
        res.json(!existe);
    } catch (error) {
        res.status(500).json({ error: 'Ha ocurrido un error' });
    }
});

/**
 * POST /rCategoriaItems
 * Crea una o varias categorías según el body.
 */
router.post('/rCategoriaItems', async (req, res) => {
    try {
        if (Array.isArray(req.body)) {
            const newItems = await modelo.insertMany(req.body);
            return res.json(newItems);
        }
        const newItem = await modelo.create(req.body);
        res.json(newItem);
    } catch (error) {
        res.status(500).json({ error: 'Ha ocurrido un error' });
    }
});

/**
 * PUT /rCategoriaItems/:id
 * Actualiza una categoría; valida que la nueva descripción sea única.
 */
router.put('/rCategoriaItems/:id', async (req, res) => {
    try {
        const nuevaDesc = req.body.descripcion;
        const yaExiste = await modelo.findOne({ descripcion: nuevaDesc, _id: { $ne: req.params.id } });
        if (yaExiste) {
            return res.status(400).json({ error: 'La descripción ya se encuentra registrada en otro documento.' });
        }

        const updated = await modelo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            return res.status(404).json({ error: 'No se encontró la categoría para actualizar.' });
        }
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Ha ocurrido un error' });
    }
});

/**
 * DELETE /rCategoriaItems/:id
 * Elimina la categoría cuyo _id coincida con el parámetro.
 */
router.delete('/rCategoriaItems/:id', async (req, res) => {
    try {
        const deleted = await modelo.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }
        res.json({ message: 'Documento eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Ha ocurrido un error' });
    }
});

export default router;
