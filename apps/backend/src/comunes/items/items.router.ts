import { Router } from 'express';
import mongoose from 'mongoose';
import { ItemModel } from './items.schema';
import { verifyToken } from '../../auth/auth.middleware';
import { successResponse, errorResponse } from '../../Utilidades/apiResponse';

const router = Router();


router.get('/rEvaDesemp', verifyToken, async (_req, res) => {
    try {
        const data = await ItemModel.find().lean();
        return successResponse(res, data, 'Ítems obtenidos correctamente');
    } catch (error) {
        console.error('[ITEMS_GET_ALL_ERROR]', error);
        return errorResponse(res, 'No se pudieron obtener los ítems', 500);
    }
});

router.get('/rEvaDesemp/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Solicitud inválida', 400);
        }

        const item = await ItemModel.findById(id).lean();

        if (!item) {
            return errorResponse(res, 'Ítem no encontrado', 404);
        }

        return successResponse(res, item, 'Ítem obtenido correctamente');
    } catch (error) {
        console.error('[ITEMS_GET_BY_ID_ERROR]', error);
        return errorResponse(res, 'No se pudo obtener el ítem', 500);
    }
});


router.post('/rEvaDesemp', verifyToken, async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return errorResponse(res, 'Datos inválidos', 400);
        }

        const item = await ItemModel.create(req.body);

        return successResponse(res, item, 'Ítem creado correctamente', 201);
    } catch (error) {
        console.error('[ITEMS_CREATE_ERROR]', error);
        return errorResponse(res, 'No se pudo crear el ítem', 500);
    }
});


router.put('/rEvaDesemp/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Solicitud inválida', 400);
        }

        const updated = await ItemModel.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updated) {
            return errorResponse(res, 'Ítem no encontrado', 404);
        }

        return successResponse(res, updated, 'Ítem actualizado correctamente');
    } catch (error) {
        console.error('[ITEMS_UPDATE_ERROR]', error);
        return errorResponse(res, 'No se pudo actualizar el ítem', 500);
    }
});

router.delete('/rEvaDesemp/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Solicitud inválida', 400);
        }

        const deleted = await ItemModel.findByIdAndDelete(id);

        if (!deleted) {
            return errorResponse(res, 'Ítem no encontrado', 404);
        }

        return successResponse(res, null, 'Ítem eliminado correctamente');
    } catch (error) {
        console.error('[ITEMS_DELETE_ERROR]', error);
        return errorResponse(res, 'No se pudo eliminar el ítem', 500);
    }
});

export default router;