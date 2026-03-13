import { Router, Request, Response } from 'express';
import { TipoEvaluacionModel } from './TipoEvaluacion.schema';
import { verifyToken } from '../auth/auth.middleware';
import { successResponse, errorResponse } from '../Utilidades/apiResponse';
import * as mongoose from 'mongoose';

const router = Router();


router.get('/', verifyToken, async (_req: Request, res: Response) => {
    try {
        const tipos = await TipoEvaluacionModel
            .find()
            .sort({ nombre: 1 });

        return successResponse(res, tipos, 'Tipos de evaluación obtenidos correctamente', 200);

    } catch (error) {
        console.error('Error GET TipoEvaluacion:', error);
        return errorResponse(res, 'Error interno al obtener los tipos de evaluación', 500);
    }
});


router.get('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'ID inválido', 400);
        }

        const tipo = await TipoEvaluacionModel.findById(id);

        if (!tipo) {
            return errorResponse(res, 'Tipo de evaluación no encontrado', 404);
        }

        return successResponse(res, tipo, 'Tipo de evaluación obtenido correctamente', 200);

    } catch (error) {
        console.error('Error GET by ID TipoEvaluacion:', error);
        return errorResponse(res, 'Error interno al obtener el tipo de evaluación', 500);
    }
});


router.post('/', verifyToken, async (req: Request, res: Response) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre || nombre.trim() === '') {
            return errorResponse(res, 'El nombre es obligatorio', 400);
        }

        // Validar duplicado (opcional pero recomendable)
        const existe = await TipoEvaluacionModel.findOne({ nombre: nombre.trim() });

        if (existe) {
            return errorResponse(res, 'Ya existe un tipo de evaluación con ese nombre', 409);
        }

        const nuevoTipo = new TipoEvaluacionModel({
            nombre: nombre.trim(),
            descripcion
        });

        const guardado = await nuevoTipo.save();

        return successResponse(res, guardado, 'Tipo de evaluación creado correctamente', 201);

    } catch (error) {
        console.error('Error POST TipoEvaluacion:', error);
        return errorResponse(res, 'Error interno al crear el tipo de evaluación', 500);
    }
});



router.put('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'ID inválido', 400);
        }

        if (!nombre || nombre.trim() === '') {
            return errorResponse(res, 'El nombre es obligatorio', 400);
        }

        const actualizado = await TipoEvaluacionModel.findByIdAndUpdate(
            id,
            {
                nombre: nombre.trim(),
                descripcion
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!actualizado) {
            return errorResponse(res, 'Tipo de evaluación no encontrado', 404);
        }

        return successResponse(res, actualizado, 'Tipo de evaluación actualizado correctamente', 200);

    } catch (error) {
        console.error('Error PUT TipoEvaluacion:', error);
        return errorResponse(res, 'Error interno al actualizar el tipo de evaluación', 500);
    }
});



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

        return successResponse(res, null, 'Tipo de evaluación eliminado correctamente', 200);

    } catch (error) {
        console.error('Error DELETE TipoEvaluacion:', error);
        return errorResponse(res, 'Error interno al eliminar el tipo de evaluación', 500);
    }
});

export default router;