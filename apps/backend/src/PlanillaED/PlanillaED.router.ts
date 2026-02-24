import { Router, Request, Response } from 'express';
import { PlanillaEDModel } from '../PlanillaED/PlanillaED.schema';
import { ItemModel } from '../comunes/items/items.schema';
import mongoose from 'mongoose';
import { verifyToken } from '../auth/auth.middleware';
import { successResponse, errorResponse } from '../Utilidades/apiResponse';

const router = Router();

router.get('/buscar-por-efector-servicio', verifyToken, async (req: Request, res: Response) => {
    try {
        const { idEfector, idServicio } = req.query;

        if (!mongoose.Types.ObjectId.isValid(String(idEfector)) ||
            !mongoose.Types.ObjectId.isValid(String(idServicio))) {
            return errorResponse(res, 'IDs inválidos', 400);
        }

        const planilla = await PlanillaEDModel.findOne({ idEfector, idServicio })
            .populate('idEfector', 'nombre')
            .populate('idServicio', 'nombre')
            .populate('categorias.categoria', 'descripcion')
            .lean();

        if (!planilla) return errorResponse(res, 'Planilla no encontrada', 404);

        return successResponse(res, planilla);
    } catch {
        return errorResponse(res, 'Error interno del servidor', 500);
    }
});

router.get('/buscar-por-tipo-evaluacion/:idTipoEvaluacion', verifyToken, async (req: Request, res: Response) => {
    try {
        const { idTipoEvaluacion } = req.params;

        if (!mongoose.Types.ObjectId.isValid(idTipoEvaluacion)) {
            return errorResponse(res, 'ID inválido', 400);
        }

        const planilla = await PlanillaEDModel.findOne({
            'tipoEvaluacion.idTipoEvaluacion': idTipoEvaluacion
        })
            .populate('idEfector', 'nombre')
            .populate('idServicio', 'nombre')
            .populate('categorias.categoria', 'descripcion')
            .lean();

        if (!planilla) return errorResponse(res, 'No se encontró planilla', 404);

        return successResponse(res, planilla);
    } catch {
        return errorResponse(res, 'Error interno', 500);
    }
});

router.get('/:id/categorias', verifyToken, async (req: Request, res: Response) => {
    try {
        const planilla: any = await PlanillaEDModel.findById(req.params.id)
            .populate('categorias.categoria')
            .lean();

        if (!planilla) return errorResponse(res, 'Planilla no encontrada', 404);

        const resumen = (planilla.categorias || []).map((cat: any) => ({
            id: cat?.categoria?._id ?? null,
            descripcion: cat?.categoria?.descripcion ?? '',
            totalItems: Array.isArray(cat?.items) ? cat.items.length : 0
        }));

        return successResponse(res, {
            planillaId: req.params.id,
            descripcion: planilla.descripcion,
            categorias: resumen
        });
    } catch {
        return errorResponse(res, 'Error al obtener categorías', 500);
    }
});

router.get('/:idDocumento/items-disponibles', verifyToken, async (req: Request, res: Response) => {
    try {
        const planilla: any = await PlanillaEDModel.findById(req.params.idDocumento).lean();
        if (!planilla) return errorResponse(res, 'Planilla no encontrada', 404);

        const usados = planilla.categorias.flatMap((c: any) =>
            (c.items || []).map((i: any) => String(i._id))
        );

        const disponibles = await ItemModel.find({ _id: { $nin: usados } })
            .sort({ descripcion: 1 })
            .lean();

        return successResponse(res, disponibles);
    } catch {
        return errorResponse(res, 'Error al obtener items', 500);
    }
});

router.get('/:idPlanilla/items/existe', verifyToken, async (req: Request, res: Response) => {
    try {
        const { itemDesc } = req.query;

        if (!itemDesc || typeof itemDesc !== 'string') {
            return errorResponse(res, 'itemDesc requerido', 400);
        }

        const planilla = await PlanillaEDModel.findById(req.params.idPlanilla).lean();
        if (!planilla) return errorResponse(res, 'Planilla no encontrada', 404);

        const normalized = itemDesc.toLowerCase().trim();
        let exists = false;

        for (const cat of planilla.categorias || []) {
            for (const item of cat.items || []) {
                if (item.descripcion?.toLowerCase().trim() === normalized) {
                    exists = true;
                    break;
                }
            }
        }

        return successResponse(res, { exists });
    } catch {
        return errorResponse(res, 'Error al verificar ítem', 500);
    }
});

router.delete('/eliminar-item', verifyToken, async (req: Request, res: Response) => {
    try {
        const { idDocumento, descripcionItem } = req.body;

        if (!idDocumento || !descripcionItem) {
            return errorResponse(res, 'Faltan parámetros', 400);
        }

        const result = await PlanillaEDModel.findOneAndUpdate(
            { _id: idDocumento },
            { $pull: { 'categorias.$[].items': { descripcion: descripcionItem } } },
            { new: true }
        );

        if (!result) return errorResponse(res, 'Documento no encontrado', 404);

        return successResponse(res, result, 'Ítem eliminado');
    } catch {
        return errorResponse(res, 'Error al eliminar', 500);
    }
});

router.get('/', verifyToken, async (_req: Request, res: Response) => {
    try {
        const planillas = await PlanillaEDModel.find()
            .populate('categorias.categoria')
            .populate('idEfector', 'nombre')
            .populate('idServicio', 'nombre')
            .lean();

        return successResponse(res, planillas);
    } catch {
        return errorResponse(res, 'Error al obtener planillas', 500);
    }
});

router.post('/', verifyToken, async (req: Request, res: Response) => {
    try {
        const { descripcion, tipoEvaluacion } = req.body;

        const existe = await PlanillaEDModel.findOne({
            "tipoEvaluacion.idTipoEvaluacion": tipoEvaluacion.idTipoEvaluacion
        });

        if (existe) {
            return errorResponse(res, 'Ya existe una planilla', 400);
        }

        const nueva = await PlanillaEDModel.create({
            descripcion,
            fechaCreacion: new Date(),
            tipoEvaluacion,
            categorias: []
        });

        return successResponse(res, nueva, 'Planilla creada', 201);
    } catch {
        return errorResponse(res, 'Error al crear planilla', 500);
    }
});

router.put('/:id/categorias', verifyToken, async (req: Request, res: Response) => {
    try {
        const planilla = await PlanillaEDModel.findById(req.params.id);
        if (!planilla) return errorResponse(res, 'Planilla no encontrada', 404);

        await planilla.save();
        return successResponse(res, planilla, 'Planilla actualizada');
    } catch {
        return errorResponse(res, 'Error al actualizar', 500);
    }
});

router.get('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const planilla = await PlanillaEDModel.findById(req.params.id)
            .populate('idEfector', 'nombre')
            .populate('idServicio', 'nombre')
            .populate('categorias.categoria', 'descripcion')
            .lean();

        if (!planilla) return errorResponse(res, 'Planilla no encontrada', 404);

        return successResponse(res, planilla);
    } catch {
        return errorResponse(res, 'Error al obtener planilla', 500);
    }
});

export default router;
