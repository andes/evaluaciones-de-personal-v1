import { Router, Request, Response } from 'express';
import { ServicioModel } from '../Schemas/servicios';
import { verifyToken } from '../../../auth/auth.middleware';
import { successResponse, errorResponse } from '../../../Utilidades/apiResponse';
import * as mongoose from 'mongoose';
import { authorizeRoles } from '../../../auth/role.middleware';
import { PERMISOS } from '../../../auth/roles.constanst';

const router = Router();


router.get('/rmServicios', verifyToken, authorizeRoles(...PERMISOS.SOLO_ADMIN), async (_req: Request, res: Response) => {
    try {

        const servicios = await ServicioModel
            .find()
            .sort({ descripcion: 1 });

        return successResponse(
            res,
            servicios,
            'Servicios obtenidos correctamente',
            200
        );

    } catch (error) {
        console.error('Error GET Servicios:', error);
        return errorResponse(res, 'Error interno al obtener los servicios', 500);
    }
});



router.get('/rmServicios/:id', verifyToken, authorizeRoles(...PERMISOS.SOLO_ADMIN), async (req: Request, res: Response) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'ID inválido', 400);
        }

        const servicio = await ServicioModel.findById(id);

        if (!servicio) {
            return errorResponse(res, 'Servicio no encontrado', 404);
        }

        return successResponse(
            res,
            servicio,
            'Servicio obtenido correctamente',
            200
        );

    } catch (error) {
        console.error('Error GET Servicio by ID:', error);
        return errorResponse(res, 'Error interno al buscar el servicio', 500);
    }
});


router.post('/rmServicios', verifyToken, authorizeRoles(...PERMISOS.SOLO_ADMIN), async (req: Request, res: Response) => {
    try {

        const { descripcion } = req.body;

        if (!descripcion || descripcion.trim() === '') {
            return errorResponse(res, 'La descripción es obligatoria', 400);
        }

        // Validar duplicado
        const existe = await ServicioModel.findOne({
            descripcion: descripcion.trim()
        });

        if (existe) {
            return errorResponse(
                res,
                'La descripción ya se encuentra registrada',
                409
            );
        }

        const nuevoServicio = new ServicioModel({
            descripcion: descripcion.trim()
        });

        const guardado = await nuevoServicio.save();

        return successResponse(
            res,
            guardado,
            'Servicio creado correctamente',
            201
        );

    } catch (error) {
        console.error('Error POST Servicio:', error);
        return errorResponse(res, 'Error interno al crear el servicio', 500);
    }
});


router.put('/rmServicios/:id', verifyToken, authorizeRoles(...PERMISOS.SOLO_ADMIN), async (req: Request, res: Response) => {
    try {

        const { id } = req.params;
        const { descripcion } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'ID inválido', 400);
        }

        if (!descripcion || descripcion.trim() === '') {
            return errorResponse(res, 'La descripción es obligatoria', 400);
        }

        // Validar duplicado excluyendo el actual
        const servicioExistente = await ServicioModel.findOne({
            descripcion: descripcion.trim(),
            _id: { $ne: id }
        });

        if (servicioExistente) {
            return errorResponse(
                res,
                'La descripción ya se encuentra registrada',
                409
            );
        }

        const actualizado = await ServicioModel.findByIdAndUpdate(
            id,
            { descripcion: descripcion.trim() },
            {
                new: true,
                runValidators: true
            }
        );

        if (!actualizado) {
            return errorResponse(res, 'Servicio no encontrado', 404);
        }

        return successResponse(
            res,
            actualizado,
            'Servicio actualizado correctamente',
            200
        );

    } catch (error) {
        console.error('Error PUT Servicio:', error);
        return errorResponse(res, 'Error interno al actualizar el servicio', 500);
    }
});



router.delete('/rmServicios/:id', verifyToken, authorizeRoles(...PERMISOS.SOLO_ADMIN), async (req: Request, res: Response) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'ID inválido', 400);
        }

        const eliminado = await ServicioModel.findByIdAndDelete(id);

        if (!eliminado) {
            return errorResponse(res, 'Servicio no encontrado', 404);
        }

        return successResponse(
            res,
            null,
            'Servicio eliminado correctamente',
            200
        );

    } catch (error) {
        console.error('Error DELETE Servicio:', error);
        return errorResponse(res, 'Error interno al eliminar el servicio', 500);
    }
});

export default router;