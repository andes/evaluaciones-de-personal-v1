import { Router, Request, Response } from 'express';
import * as mongoose from 'mongoose';
import { PlanillaEvaluacionCabeceraModel } from '../PlanillaEDEvaluacion/EvaluacionCabecera.schema';
import { EvaluacionDetalleModel } from './EvaluacionDetalle.schema';
import { verifyToken } from '../auth/auth.middleware';
import { successResponse, errorResponse } from '../Utilidades/apiResponse';

const router = Router();


// grilla resumen
router.get('/evaluaciones-resumen', verifyToken, async (_req: Request, res: Response) => {
    try {

        const data = await EvaluacionDetalleModel.aggregate([
            {
                $lookup: {
                    from: 'planilla_evaluacion_cabecera',
                    localField: 'idPlanillaEvaluacionCabecera',
                    foreignField: '_id',
                    as: 'cabecera'
                }
            },
            { $unwind: '$cabecera' },
            {
                $project: {
                    _id: 0,
                    periodo: '$cabecera.periodo',
                    agenteEvaluado: 1,
                    agenteEvaluador: '$cabecera.agenteevaluador',
                    estado: '$tipoCierreEvaluacion.nombreTipoCierreEvaluacion'
                }
            },
            {
                $sort: {
                    'agenteEvaluado.nombreAgenteEvaluado': 1,
                    periodo: -1
                }
            }
        ]);

        return successResponse(res, data, 'Evaluaciones obtenidas correctamente');

    } catch (error) {

        return errorResponse(res, 'Error interno', 500);

    }
});


// todas las evaluaciones
router.get('/evaluacioneslisttodas', verifyToken, async (_req: Request, res: Response) => {
    try {

        const data = await EvaluacionDetalleModel.aggregate([
            {
                $lookup: {
                    from: 'planilla_evaluacion_cabecera',
                    localField: 'idPlanillaEvaluacionCabecera',
                    foreignField: '_id',
                    as: 'cabecera'
                }
            },
            { $unwind: '$cabecera' },
            {
                $project: {
                    _id: 0,
                    agenteEvaluado: 1,
                    periodo: '$cabecera.periodo',
                    agenteEvaluador: '$cabecera.agenteevaluador',
                    efector: '$cabecera.Efector',
                    servicio: '$cabecera.Servicio',
                    tipoCierreEvaluacion: 1
                }
            },
            { $sort: { 'agenteEvaluado.nombreAgenteEvaluado': 1, periodo: -1 } }
        ]);

        return successResponse(res, data, 'Evaluaciones obtenidas correctamente');

    } catch {

        return errorResponse(res, 'Error interno', 500);

    }
});



router.get('/buscar-agente', verifyToken, async (req: Request, res: Response) => {
    try {

        const { legajo, nombre } = req.query;
        const match: any = {};

        if (legajo) {
            match['agenteEvaluado.legajo'] = { $regex: legajo, $options: 'i' };
        }

        if (nombre) {
            match['agenteEvaluado.nombreAgenteEvaluado'] = { $regex: nombre, $options: 'i' };
        }

        const data = await EvaluacionDetalleModel.aggregate([
            {
                $lookup: {
                    from: 'planilla_evaluacion_cabecera',
                    localField: 'idPlanillaEvaluacionCabecera',
                    foreignField: '_id',
                    as: 'cabecera'
                }
            },
            { $unwind: '$cabecera' },
            { $match: match },
            {
                $project: {
                    _id: 0,
                    agenteEvaluado: 1,
                    periodo: '$cabecera.periodo',
                    agenteEvaluador: '$cabecera.agenteevaluador',
                    estado: '$cabecera.tipoCierreEvaluacion.nombre'
                }
            },
            { $sort: { 'agenteEvaluado.nombreAgenteEvaluado': 1, periodo: -1 } }
        ]);

        return successResponse(res, data, 'Búsqueda realizada correctamente');

    } catch {

        return errorResponse(res, 'Error interno', 500);

    }
});


router.get('/buscar-evaluador', verifyToken, async (req: Request, res: Response) => {
    try {

        const { idUsuario, nombre } = req.query;
        const match: any = {};

        if (idUsuario && mongoose.Types.ObjectId.isValid(idUsuario as string)) {
            match['cabecera.agenteevaluador.idUsuarioEvaluador'] =
                new mongoose.Types.ObjectId(idUsuario as string);
        }

        if (nombre) {
            match['cabecera.agenteevaluador.nombreUsuarioEvaluador'] =
                { $regex: nombre, $options: 'i' };
        }

        const data = await EvaluacionDetalleModel.aggregate([
            {
                $lookup: {
                    from: 'planilla_evaluacion_cabecera',
                    localField: 'idPlanillaEvaluacionCabecera',
                    foreignField: '_id',
                    as: 'cabecera'
                }
            },
            { $unwind: '$cabecera' },
            { $match: match },
            {
                $project: {
                    _id: 0,
                    agenteEvaluado: 1,
                    periodo: '$cabecera.periodo',
                    agenteEvaluador: '$cabecera.agenteevaluador',
                    estado: '$cabecera.tipoCierreEvaluacion.nombre'
                }
            }
        ]);

        return successResponse(res, data, 'Búsqueda realizada correctamente');

    } catch {

        return errorResponse(res, 'Error interno', 500);

    }
});




// por agente
router.get('/evaluaciones/por-agente/:idAgente', verifyToken, async (req: Request, res: Response) => {

    const { idAgente } = req.params;

    if (!mongoose.Types.ObjectId.isValid(idAgente)) {
        return errorResponse(res, 'ID inválido', 400);
    }

    try {

        const data = await EvaluacionDetalleModel.aggregate([
            {
                $lookup: {
                    from: 'planilla_evaluacion_cabecera',
                    localField: 'idPlanillaEvaluacionCabecera',
                    foreignField: '_id',
                    as: 'cabecera'
                }
            },
            { $unwind: '$cabecera' },
            {
                $match: {
                    'agenteEvaluado.idAgenteEvaluado': new mongoose.Types.ObjectId(idAgente)
                }
            }
        ]);

        return successResponse(res, data, 'Evaluaciones del agente obtenidas');

    } catch {

        return errorResponse(res, 'Error interno', 500);

    }

});


// por tipo de cierre
router.get('/por-tipo-cierre/:idTipoCierre', verifyToken, async (req: Request, res: Response) => {

    const { idTipoCierre } = req.params;

    if (!mongoose.Types.ObjectId.isValid(idTipoCierre)) {
        return errorResponse(res, 'ID inválido', 400);
    }

    try {

        const data = await EvaluacionDetalleModel.find({
            'tipoCierreEvaluacion.idTipoCierreEvaluacion':
                new mongoose.Types.ObjectId(idTipoCierre)
        });

        return successResponse(res, data, 'Evaluaciones obtenidas');

    } catch {

        return errorResponse(res, 'Error interno', 500);

    }

});


// evaluación completa
router.get('/evaluacion-completa/:idCabecera', verifyToken, async (req: Request, res: Response) => {

    const { idCabecera } = req.params;

    if (!mongoose.Types.ObjectId.isValid(idCabecera)) {
        return errorResponse(res, 'ID inválido', 400);
    }

    try {

        const cabecera = await PlanillaEvaluacionCabeceraModel.findById(idCabecera).lean();

        if (!cabecera) {
            return errorResponse(res, 'Cabecera no encontrada', 404);
        }

        const detalles = await EvaluacionDetalleModel.find({
            idPlanillaEvaluacionCabecera: idCabecera
        })
            .populate('categorias.idCategoria', 'descripcionCategoria')
            .populate('categorias.items.idItem', 'descripcion')
            .lean();

        return successResponse(res, { cabecera, detalles }, 'Evaluación completa obtenida');

    } catch {

        return errorResponse(res, 'Error interno', 500);

    }

});

export default router;