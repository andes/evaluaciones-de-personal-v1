import { Router } from 'express';
import { TipoCierreEvaluacionModel } from './TipoCierreEvaluacion.schema';
import { verifyToken } from '../../auth/auth.middleware';
import { successResponse, errorResponse } from '../../Utilidades/apiResponse';

const router = Router();

router.get('/', verifyToken, async (req, res) => {
    try {
        const data = await TipoCierreEvaluacionModel.find().sort({ nombre: 1 });
        return successResponse(res, data, 'Datos obtenidos correctamente');
    } catch (error) {
        return errorResponse(res, 'Error al obtener los datos', 500, error);
    }
});

router.get('/:id', verifyToken, async (req, res) => {
    try {
        const data = await TipoCierreEvaluacionModel.findById(req.params.id);

        if (!data) {
            return errorResponse(res, 'No se encontró el documento', 404);
        }

        return successResponse(res, data, 'Documento obtenido correctamente');
    } catch (error) {
        return errorResponse(res, 'Error al obtener el documento', 500, error);
    }
});

router.post('/', verifyToken, async (req, res) => {
    try {
        const nuevo = await TipoCierreEvaluacionModel.create(req.body);

        return successResponse(
            res,
            nuevo,
            'Documento creado correctamente',
            201
        );
    } catch (error) {
        return errorResponse(res, 'Error al crear el documento', 500, error);
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    try {
        const actualizado = await TipoCierreEvaluacionModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!actualizado) {
            return errorResponse(
                res,
                'No se encontró el documento para actualizar',
                404
            );
        }

        return successResponse(
            res,
            actualizado,
            'Documento actualizado correctamente'
        );
    } catch (error) {
        return errorResponse(res, 'Error al actualizar el documento', 500, error);
    }
});

export default router;
