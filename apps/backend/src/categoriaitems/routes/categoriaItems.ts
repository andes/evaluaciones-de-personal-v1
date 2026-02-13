import { Router } from 'express';
import { CategoriaItemModel as modelo } from '../schemas/categoriaItems';
import { verifyToken } from '../../auth/auth.middleware';
import { successResponse, errorResponse } from '../../Utilidades/apiResponse';

const router = Router();



router.get('/rmCategoriaItems', verifyToken, async (req, res) => {
    try {
        const data = await modelo.find().sort({ descripcion: 1 });

        return successResponse(
            res,
            data,
            'Categorías obtenidas correctamente'
        );

    } catch (error) {
        return errorResponse(res, 'Error al obtener categorías', 500, error);
    }
});



router.get('/rmCategoriaItems/:id', verifyToken, async (req, res) => {
    try {
        const doc = await modelo.findById(req.params.id);

        if (!doc) {
            return errorResponse(res, 'Documento no encontrado', 404);
        }

        return successResponse(res, doc, 'Documento obtenido correctamente');

    } catch (error) {
        return errorResponse(res, 'Ha ocurrido un error', 500, error);
    }
});


router.get('/rmCategoriaItems/verificar-descripcion/:descripcion', verifyToken, async (req, res) => {
    try {
        const existe = await modelo.findOne({
            descripcion: req.params.descripcion
        });

        return successResponse(
            res,
            !existe,
            existe ? 'La descripción ya existe' : 'Descripción disponible'
        );

    } catch (error) {
        return errorResponse(res, 'Ha ocurrido un error', 500, error);
    }
});


router.post('/rCategoriaItems', verifyToken, async (req, res) => {
    try {

        if (Array.isArray(req.body)) {
            const newItems = await modelo.insertMany(req.body);

            return successResponse(
                res,
                newItems,
                'Categorías creadas correctamente',
                201
            );
        }

        const newItem = await modelo.create(req.body);

        return successResponse(
            res,
            newItem,
            'Categoría creada correctamente',
            201
        );

    } catch (error) {
        return errorResponse(res, 'Error al crear categoría', 500, error);
    }
});


router.put('/rCategoriaItems/:id', verifyToken, async (req, res) => {
    try {

        const yaExiste = await modelo.findOne({
            descripcion: req.body.descripcion,
            _id: { $ne: req.params.id }
        });

        if (yaExiste) {
            return errorResponse(
                res,
                'La descripción ya se encuentra registrada',
                400
            );
        }

        const updated = await modelo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) {
            return errorResponse(res, 'No se encontró la categoría', 404);
        }

        return successResponse(
            res,
            updated,
            'Actualizado correctamente'
        );

    } catch (error) {
        return errorResponse(res, 'Error al actualizar', 500, error);
    }
});


router.delete('/rCategoriaItems/:id', verifyToken, async (req, res) => {
    try {

        const deleted = await modelo.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return errorResponse(res, 'Documento no encontrado', 404);
        }

        return successResponse(
            res,
            null,
            'Documento eliminado correctamente'
        );

    } catch (error) {
        return errorResponse(res, 'Error al eliminar', 500, error);
    }
});

export default router;
