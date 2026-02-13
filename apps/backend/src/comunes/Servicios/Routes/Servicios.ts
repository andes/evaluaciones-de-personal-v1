import { Router } from 'express';
import { ServicioModel } from '../Schemas/servicios';
import { verifyToken } from '../../../auth/auth.middleware';
import { successResponse, errorResponse } from '../../../Utilidades/apiResponse';

const router = Router();

router.get('/rmServicios', verifyToken, async (req, res) => {
    try {
        const data = await ServicioModel.find().sort({ descripcion: 1 });
        return successResponse(res, data, 'Servicios obtenidos correctamente');
    } catch (error) {
        return errorResponse(res, 'Error al obtener los servicios', 500, error);
    }
});

router.get('/rmServicios/:id', verifyToken, async (req, res) => {
    try {
        const respuesta = await ServicioModel.findById(req.params.id);

        if (!respuesta) {
            return errorResponse(res, 'Servicio no encontrado', 404);
        }

        return successResponse(res, respuesta, 'Servicio obtenido correctamente');
    } catch (error) {
        return errorResponse(res, 'Error al buscar el servicio', 500, error);
    }
});

router.post('/rmServicios', verifyToken, async (req, res) => {
    try {
        const nuevoServicio = await ServicioModel.create(req.body);

        return successResponse(
            res,
            nuevoServicio,
            'Servicio creado correctamente',
            201
        );
    } catch (error) {
        return errorResponse(res, 'Ha ocurrido un error', 500, error);
    }
});

router.put('/rmServicios/:id', verifyToken, async (req, res) => {
    try {
        const nuevaDescripcion = req.body.descripcion;

        const servicioExistente = await ServicioModel.findOne({
            descripcion: nuevaDescripcion,
            _id: { $ne: req.params.id }
        });

        if (servicioExistente) {
            return errorResponse(
                res,
                'La descripción ya se encuentra registrada',
                400
            );
        }

        const respuesta = await ServicioModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!respuesta) {
            return errorResponse(res, 'Servicio no encontrado', 404);
        }

        return successResponse(
            res,
            respuesta,
            'Servicio actualizado correctamente'
        );

    } catch (error) {
        return errorResponse(res, 'Ha ocurrido un error', 500, error);
    }
});

export default router;
