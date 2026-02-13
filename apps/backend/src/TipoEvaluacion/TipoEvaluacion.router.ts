import { Router, Request, Response } from 'express';
import { TipoEvaluacionModel } from './TipoEvaluacion.schema';
import { verifyToken } from '../auth/auth.middleware';
import { successResponse, errorResponse } from '../Utilidades/apiResponse';
import * as mongoose from 'mongoose';

const router = Router();

// GET todos
router.get('/', verifyToken, async (_req: Request, res: Response) => {
    try {
        const tipos = await TipoEvaluacionModel.find().sort({ nombre: 1 });
        return successResponse(res, tipos);
    } catch {
        return errorResponse(res, 'Error al obtener los tipos de evaluación', 500);
    }
});

// POST crear
router.post('/', verifyToken, async (req: Request, res: Response) => {
    try {
        if (!req.body.nombre || req.body.nombre.trim() === '') {
            return errorResponse(res, 'El nombre es obligatorio', 400);
        }

        const nuevoTipo = new TipoEvaluacionModel(req.body);
        const guardado = await nuevoTipo.save();

        return successResponse(res, guardado, 'Tipo de evaluación creado', 201);
    } catch {
        return errorResponse(res, 'Error al crear el tipo de evaluación', 400);
    }
});

// PUT actualizar
router.put('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'ID inválido', 400);
        }

        const actualizado = await TipoEvaluacionModel.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!actualizado) {
            return errorResponse(res, 'Tipo de evaluación no encontrado', 404);
        }

        return successResponse(res, actualizado, 'Tipo de evaluación actualizado');
    } catch {
        return errorResponse(res, 'Error al actualizar el tipo de evaluación', 400);
    }
});

// DELETE
router.delete('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'ID inválido', 400);
        }

        const eliminado = await TipoEvaluacionModel.findByIdAndDelete(id);

        if (!eliminado) {
            return errorResponse(res, 'Tipo de evaluación no encontrado', 404);
        }

        return successResponse(res, null, 'Tipo de evaluación eliminado');
    } catch {
        return errorResponse(res, 'Error al eliminar el tipo de evaluación', 400);
    }
});

export default router;
