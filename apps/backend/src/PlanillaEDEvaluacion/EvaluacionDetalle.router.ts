import { Router, Request, Response } from 'express';
import { EvaluacionDetalleModel } from './EvaluacionDetalle.schema';
import { ItemModel } from '../comunes/items/items.schema';
import * as mongoose from 'mongoose';
import { verifyToken } from '../auth/auth.middleware';
import { successResponse, errorResponse } from '../Utilidades/apiResponse';

const router = Router();

type AgenteSimple = {
    idAgenteEvaluado: string;
    nombreAgenteEvaluado: string;
    legajo: string;
};

router.get('/existe/:idCabecera/:idAgente', verifyToken, async (req: Request, res: Response) => {
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

    } catch {
        return errorResponse(res, 'Error interno al verificar existencia', 500);
    }
});

router.get('/por-cabecera/:idCabecera', verifyToken, async (req: Request, res: Response) => {
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

    } catch {
        return errorResponse(res, 'Error interno al obtener evaluaciones', 500);
    }
});

router.get('/por-cabecera/:idCabecera/agentes', verifyToken, async (req: Request, res: Response) => {
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

        const lista = agentes.map(a => a.agenteEvaluado).filter(Boolean);

        return successResponse(res, lista);

    } catch {
        return errorResponse(res, 'Error interno al obtener agentes', 500);
    }
});

router.get('/categorias-items/:idEvaluacion/:idAgente', verifyToken, async (req: Request, res: Response) => {
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

        const categorias = (evaluacion.categorias || []).map(c => ({
            idCategoria: c.idCategoria?.toString(),
            descripcionCategoria: c.descripcionCategoria || 'No encontrada',
            items: (c.items || []).map(item => ({
                _id: item.idItem?.toString(),
                descripcion: item.descripcion || 'No encontrado',
                puntaje: item.puntaje ?? 0
            }))
        }));

        return successResponse(res, categorias);

    } catch {
        return errorResponse(res, 'Error interno al obtener categorías e ítems', 500);
    }
});

router.put('/corregir-items/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'ID inválido', 400);
        }

        const evaluacion = await EvaluacionDetalleModel.findById(id);
        if (!evaluacion) return errorResponse(res, 'Evaluación no encontrada', 404);

        for (const categoria of evaluacion.categorias) {
            for (const item of categoria.items) {
                const itemReal = await ItemModel.findOne({ descripcion: item.descripcion });
                if (itemReal) item.idItem = itemReal._id;
            }
        }

        await evaluacion.save();

        return successResponse(res, null, 'IDs de ítems corregidos');

    } catch {
        return errorResponse(res, 'Error interno al corregir ítems', 500);
    }
});

router.put('/:idCabecera/agente/:idAgente/tipo-cierreCabecera', verifyToken, async (req: Request, res: Response) => {
    try {
        const { idCabecera, idAgente } = req.params;
        const { tipoCierreEvaluacion } = req.body;

        if (!mongoose.Types.ObjectId.isValid(idCabecera) || !mongoose.Types.ObjectId.isValid(idAgente)) {
            return errorResponse(res, 'IDs inválidos', 400);
        }

        if (!tipoCierreEvaluacion?.idTipoCierreEvaluacion) {
            return errorResponse(res, 'Datos de tipo de cierre incompletos', 400);
        }

        const evaluacion = await EvaluacionDetalleModel.findOne({
            idPlanillaEvaluacionCabecera: idCabecera,
            'agenteEvaluado.idAgenteEvaluado': idAgente
        });

        if (!evaluacion) return errorResponse(res, 'Evaluación no encontrada', 404);

        evaluacion.tipoCierreEvaluacion = {
            idTipoCierreEvaluacion: tipoCierreEvaluacion.idTipoCierreEvaluacion,
            nombreTipoCierreEvaluacion: tipoCierreEvaluacion.nombreTipoCierreEvaluacion ?? '',
            detalle: tipoCierreEvaluacion.detalle ?? '',
            descripcion: tipoCierreEvaluacion.descripcion ?? '',
            fechaCierre: new Date()
        };

        await evaluacion.save();

        return successResponse(res, evaluacion, 'Tipo de cierre actualizado');

    } catch {
        return errorResponse(res, 'Error interno al actualizar tipo de cierre', 500);
    }
});

router.post('/', verifyToken, async (req: Request, res: Response) => {
    try {
        const { _id, idPlanillaEvaluacionCabecera, agenteEvaluado, categorias } = req.body;

        if (!idPlanillaEvaluacionCabecera || !agenteEvaluado?.idAgenteEvaluado) {
            return errorResponse(res, 'Faltan campos requeridos', 400);
        }

        const categoriasT = categorias.map((cat: any) => ({
            idCategoria: cat.idCategoria,
            descripcionCategoria: cat.descripcionCategoria,
            items: cat.items.map((i: any) => ({
                idItem: i.idItem,
                descripcion: i.descripcion,
                puntaje: i.puntaje
            }))
        }));

        const nueva = new EvaluacionDetalleModel({
            _id,
            idPlanillaEvaluacionCabecera,
            agenteEvaluado,
            tipoCierreEvaluacion: {
                idTipoCierreEvaluacion: '691b1629fac1f621db17efa5',
                nombreTipoCierreEvaluacion: 'Evaluación Abierta',
                detalle: 'Evaluación Abierta',
                fechaCierre: new Date(),
                descripcion: ''
            },
            categorias: categoriasT
        });

        const guardada = await nueva.save();

        return successResponse(res, guardada, 'Evaluación creada', 201);

    } catch {
        return errorResponse(res, 'Error al crear evaluación', 500);
    }
});

router.get('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return errorResponse(res, 'ID inválido', 400);
        }

        const evaluacion = await EvaluacionDetalleModel.findById(req.params.id)
            .populate({ path: 'categorias.idCategoria', select: 'descripcionCategoria' })
            .populate({ path: 'categorias.items.idItem', select: 'descripcion' })
            .lean();

        if (!evaluacion) return errorResponse(res, 'Evaluación no encontrada', 404);

        return successResponse(res, evaluacion);

    } catch {
        return errorResponse(res, 'Error al obtener evaluación', 500);
    }
});

router.put('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return errorResponse(res, 'ID inválido', 400);
        }

        const actualizada = await EvaluacionDetalleModel.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!actualizada) return errorResponse(res, 'Evaluación no encontrada', 404);

        return successResponse(res, actualizada, 'Evaluación actualizada');

    } catch {
        return errorResponse(res, 'Error al actualizar evaluación', 500);
    }
});

router.delete('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return errorResponse(res, 'ID inválido', 400);
        }

        const eliminada = await EvaluacionDetalleModel.findByIdAndDelete(req.params.id);

        if (!eliminada) return errorResponse(res, 'Evaluación no encontrada', 404);

        return successResponse(res, null, 'Evaluación eliminada');

    } catch {
        return errorResponse(res, 'Error al eliminar evaluación', 500);
    }
});

router.delete('/', verifyToken, async (_req: Request, res: Response) => {
    try {
        const result = await EvaluacionDetalleModel.deleteMany({});
        return successResponse(res, { deleted: result.deletedCount }, 'Todas eliminadas');

    } catch {
        return errorResponse(res, 'Error al eliminar todas', 500);
    }
});

export default router;
