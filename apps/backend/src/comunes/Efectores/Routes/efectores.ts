import { Router } from 'express';
import { EfectorModel } from '../schemas/efectores';
import { verifyToken } from '../../../auth/auth.middleware';
import { successResponse, errorResponse } from '../../../Utilidades/apiResponse';

const router = Router();

router.get('/rmEfectores', verifyToken, async (req, res) => {
    try {
        const data = await EfectorModel.find().sort({ descripcion: 1 });
        return successResponse(res, data, 'Efectores obtenidos correctamente');
    } catch (error) {
        return errorResponse(res, 'Error al obtener los efectores', 500, error);
    }
});

router.get('/rmEfectores/:id', verifyToken, async (req, res) => {
    try {
        const respuesta = await EfectorModel.findById(req.params.id);

        if (!respuesta) {
            return errorResponse(res, 'Efector no encontrado', 404);
        }

        return successResponse(res, respuesta, 'Efector obtenido correctamente');
    } catch (error) {
        return errorResponse(res, 'Error al buscar el efector', 500, error);
    }
});

router.post('/rmEfectores', verifyToken, async (req, res) => {
    try {
        const { nombre } = req.body;

        const nuevoEfector = new EfectorModel({ nombre });
        const resultado = await nuevoEfector.save();

        return successResponse(res, resultado, 'Efector creado correctamente', 201);

    } catch (error) {
        return errorResponse(res, 'Error al crear el efector', 400, error);
    }
});

export default router;
