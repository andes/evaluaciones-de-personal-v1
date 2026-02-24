import { Router } from 'express';
import { ItemModel } from './items.schema';
import { verifyToken } from '../../auth/auth.middleware';
import { successResponse, errorResponse } from '../../Utilidades/apiResponse';

const router = Router();

router.get('/rEvaDesemp', verifyToken, async (req, res) => {
    try {
        const data = await ItemModel.find();
        return successResponse(res, data, 'Ítems obtenidos correctamente');
    } catch (error) {
        return errorResponse(res, 'Error al obtener los ítems', 500, error);
    }
});

router.get('/rEvaDesemp/:id', verifyToken, async (req, res) => {
    try {
        const item = await ItemModel.findById(req.params.id);

        if (!item) {
            return errorResponse(res, 'Ítem no encontrado', 404);
        }

        return successResponse(res, item, 'Ítem obtenido correctamente');
    } catch (error) {
        return errorResponse(res, 'Error al obtener el ítem', 500, error);
    }
});

router.post('/rEvaDesemp', verifyToken, async (req, res) => {
    try {
        if (Array.isArray(req.body)) {
            const items = await ItemModel.insertMany(req.body);
            return successResponse(res, items, 'Ítems creados correctamente', 201);
        }

        const item = await ItemModel.create(req.body);
        return successResponse(res, item, 'Ítem creado correctamente', 201);
    } catch (error) {
        return errorResponse(res, 'Error al crear el ítem', 500, error);
    }
});

router.put('/rEvaDesemp/:id', verifyToken, async (req, res) => {
    try {
        const updated = await ItemModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) {
            return errorResponse(res, 'Ítem no encontrado para actualizar', 404);
        }

        return successResponse(res, updated, 'Ítem actualizado correctamente');
    } catch (error) {
        return errorResponse(res, 'Error al actualizar el ítem', 500, error);
    }
});

router.delete('/rEvaDesemp/:id', verifyToken, async (req, res) => {
    try {
        const deleted = await ItemModel.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return errorResponse(res, 'Ítem no encontrado', 404);
        }

        return successResponse(res, null, 'Ítem eliminado correctamente');
    } catch (error) {
        return errorResponse(res, 'Error al eliminar el ítem', 500, error);
    }
});

export default router;
