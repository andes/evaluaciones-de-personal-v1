import { Router, Request, Response } from 'express';
import { EvaluacionDetalleModel } from './EvaluacionDetalle.schema';
import { ItemModel } from '../comunes/items/items.schema';
import * as mongoose from 'mongoose';
import { verifyToken } from '../auth/auth.middleware';
import { successResponse, errorResponse } from '../Utilidades/apiResponse';
import { authorizeRoles } from '../auth/role.middleware';
import { PERMISOS } from '../auth/roles.constanst';

const router = Router();

type AgenteSimple = {
    idAgenteEvaluado: string;
    nombreAgenteEvaluado: string;
    legajo: string;
};



//  Corregir IDs de ítems
router.put('/corregir-items/:id', verifyToken, authorizeRoles(...PERMISOS.GESTION_AGENTES), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'ID inválido', 400);
        }

        const evaluacion = await EvaluacionDetalleModel.findById(id);
        if (!evaluacion) {
            return errorResponse(res, 'Evaluación no encontrada', 404);
        }

        for (const categoria of evaluacion.categorias) {
            for (const item of categoria.items) {
                const itemReal = await ItemModel.findOne({ descripcion: item.descripcion });
                if (itemReal) {
                    item.idItem = itemReal._id;
                }
            }
        }

        await evaluacion.save();

        return successResponse(res, null, 'IDs de ítems corregidos');
    } catch (error) {
        console.error('Error en corregir-items:', error);
        return errorResponse(res, 'Error interno al corregir ítems', 500);
    }
});

// Verificar existencia
router.get('/existe/:idCabecera/:idAgente', verifyToken, authorizeRoles(...PERMISOS.GESTION_AGENTES), async (req, res) => {
    try {
        const { idCabecera, idAgente } = req.params;

        if (!mongoose.Types.ObjectId.isValid(idCabecera) || !mongoose.Types.ObjectId.isValid(idAgente)) {
            return errorResponse(res, 'IDs inválidos', 400);
        }

        const existe = await EvaluacionDetalleModel.exists({
            idPlanillaEvaluacionCabecera: idCabecera,
            'agenteEvaluado.idAgenteEvaluado': idAgente
        });

        return successResponse(res, { existe: !!existe });
    } catch (error) {
        console.error('Error en existe:', error);
        return errorResponse(res, 'Error interno al verificar existencia', 500);
    }
});

// Obtener por cabecera
router.get('/por-cabecera/:idCabecera', verifyToken, authorizeRoles(...PERMISOS.GESTION_AGENTES), async (req, res) => {
    try {
        const { idCabecera } = req.params;

        if (!mongoose.Types.ObjectId.isValid(idCabecera)) {
            return errorResponse(res, 'ID de cabecera inválido', 400);
        }

        const evaluaciones = await EvaluacionDetalleModel.find({
            idPlanillaEvaluacionCabecera: idCabecera
        })
            .populate({ path: 'categorias.idCategoria', select: 'descripcionCategoria' })
            .populate({ path: 'categorias.items.idItem', select: 'descripcion' })
            .lean();

        return successResponse(res, evaluaciones);
    } catch (error) {
        console.error('Error en por-cabecera:', error);
        return errorResponse(res, 'Error interno al obtener evaluaciones', 500);
    }
});

// Agentes por cabecera
router.get('/por-cabecera/:idCabecera/agentes', verifyToken, authorizeRoles(...PERMISOS.GESTION_AGENTES), async (req, res) => {
    try {
        const { idCabecera } = req.params;

        if (!mongoose.Types.ObjectId.isValid(idCabecera)) {
            return errorResponse(res, 'ID de cabecera inválido', 400);
        }

        const agentes = await EvaluacionDetalleModel.find(
            { idPlanillaEvaluacionCabecera: idCabecera },
            {
                'agenteEvaluado.idAgenteEvaluado': 1,
                'agenteEvaluado.nombreAgenteEvaluado': 1,
                'agenteEvaluado.legajo': 1,
                _id: 0
            }
        ).lean<{ agenteEvaluado: AgenteSimple }[]>();

        return successResponse(
            res,
            agentes.map(a => a.agenteEvaluado).filter(Boolean)
        );
    } catch (error) {
        console.error('Error en agentes:', error);
        return errorResponse(res, 'Error interno al obtener agentes', 500);
    }
});

// categorías + ítems por cabecera y agente
router.get('/categorias-items/:idEvaluacion/:idAgente', verifyToken, authorizeRoles(...PERMISOS.GESTION_AGENTES), async (req, res) => {
    try {
        const { idEvaluacion, idAgente } = req.params;

        if (!mongoose.Types.ObjectId.isValid(idEvaluacion) || !mongoose.Types.ObjectId.isValid(idAgente)) {
            return errorResponse(res, 'IDs inválidos', 400);
        }

        const evaluacion = await EvaluacionDetalleModel.findOne({
            idPlanillaEvaluacionCabecera: idEvaluacion,
            'agenteEvaluado.idAgenteEvaluado': idAgente
        }).lean();

        if (!evaluacion) {
            return errorResponse(res, 'Evaluación no encontrada', 404);
        }

        return successResponse(res, evaluacion.categorias ?? []);
    } catch (error) {
        console.error('Error en categorias-items:', error);
        return errorResponse(res, 'Error interno al obtener categorías e ítems', 500);
    }
});

//  Actualizar tipo de cierre
router.put('/:idCabecera/agente/:idAgente/tipo-cierreCabecera', verifyToken, authorizeRoles(...PERMISOS.GESTION_AGENTES), async (req, res) => {
    try {
        const { idCabecera, idAgente } = req.params;
        const { tipoCierreEvaluacion } = req.body;

        if (!mongoose.Types.ObjectId.isValid(idCabecera) || !mongoose.Types.ObjectId.isValid(idAgente)) {
            return errorResponse(res, 'IDs inválidos', 400);
        }

        const evaluacion = await EvaluacionDetalleModel.findOne({
            idPlanillaEvaluacionCabecera: idCabecera,
            'agenteEvaluado.idAgenteEvaluado': idAgente
        });

        if (!evaluacion) {
            return errorResponse(res, 'Evaluación no encontrada', 404);
        }

        evaluacion.tipoCierreEvaluacion = {
            ...tipoCierreEvaluacion,
            fechaCierre: new Date()
        };

        await evaluacion.save();

        return successResponse(res, evaluacion, 'Tipo de cierre actualizado');
    } catch (error) {
        console.error('Error en tipo-cierre:', error);
        return errorResponse(res, 'Error interno al actualizar tipo de cierre', 500);
    }
});



// POST
router.post('/', verifyToken, authorizeRoles(...PERMISOS.GESTION_AGENTES), async (req, res) => {
    try {
        const nueva = new EvaluacionDetalleModel(req.body);
        const guardada = await nueva.save();
        return successResponse(res, guardada, 'Evaluación creada', 201);
    } catch (error: any) {
        console.error('Error en POST:', error);
        return errorResponse(res, error.message || 'Error al crear evaluación', 500);
    }
});

// GET by ID
router.get('/:id', verifyToken, authorizeRoles(...PERMISOS.GESTION_AGENTES), async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return errorResponse(res, 'ID inválido', 400);
        }

        const evaluacion = await EvaluacionDetalleModel.findById(req.params.id).lean();

        if (!evaluacion) {
            return errorResponse(res, 'Evaluación no encontrada', 404);
        }

        return successResponse(res, evaluacion);
    } catch (error) {
        console.error('Error en GET by id:', error);
        return errorResponse(res, 'Error al obtener evaluación', 500);
    }
});

// PUT by ID
router.put('/:id', verifyToken, authorizeRoles(...PERMISOS.GESTION_AGENTES), async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return errorResponse(res, 'ID inválido', 400);
        }

        const actualizada = await EvaluacionDetalleModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!actualizada) {
            return errorResponse(res, 'Evaluación no encontrada', 404);
        }

        return successResponse(res, actualizada, 'Evaluación actualizada');
    } catch (error) {
        console.error('Error en PUT:', error);
        return errorResponse(res, 'Error al actualizar evaluación', 500);
    }
});

// DELETE by ID
router.delete('/:id', verifyToken, authorizeRoles(...PERMISOS.GESTION_AGENTES), async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return errorResponse(res, 'ID inválido', 400);
        }

        const eliminada = await EvaluacionDetalleModel.findByIdAndDelete(req.params.id);

        if (!eliminada) {
            return errorResponse(res, 'Evaluación no encontrada', 404);
        }

        return successResponse(res, null, 'Evaluación eliminada');
    } catch (error) {
        console.error('Error en DELETE:', error);
        return errorResponse(res, 'Error al eliminar evaluación', 500);
    }
});

export default router;