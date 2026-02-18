import { Router, Request, Response } from 'express';
import { EvaluacionDetalleModel } from './EvaluacionDetalle.schema';
import * as mongoose from 'mongoose';
import { verifyToken } from '../auth/auth.middleware';
import { successResponse, errorResponse } from '../Utilidades/apiResponse';

const router = Router();

// Validar IDs
function validarIds(idCabecera: string, idAgente: string, res: Response) {
    if (!mongoose.Types.ObjectId.isValid(idCabecera) || !mongoose.Types.ObjectId.isValid(idAgente)) {
        errorResponse(res, 'ID inválido', 400);
        return false;
    }
    return true;
}

//  Agentes evaluados con filtros
router.get('/agentes-evaluados', verifyToken, async (req: Request, res: Response) => {
    try {
        const {
            idAgenteEvaluado,
            idAgenteEvaluador,
            fechaDesde,
            fechaHasta,
            estado
        } = req.query;

        const matchDetalle: any = {};
        const matchCabecera: any = {};

        if (idAgenteEvaluado && mongoose.Types.ObjectId.isValid(idAgenteEvaluado as string)) {
            matchDetalle["agenteEvaluado.idAgenteEvaluado"] =
                new mongoose.Types.ObjectId(idAgenteEvaluado as string);
        }

        if (idAgenteEvaluador && mongoose.Types.ObjectId.isValid(idAgenteEvaluador as string)) {
            matchCabecera["agenteevaluador.idUsuarioEvaluador"] =
                new mongoose.Types.ObjectId(idAgenteEvaluador as string);
        }

        if (fechaDesde || fechaHasta) {
            matchCabecera.periodo = {};
            if (fechaDesde) matchCabecera.periodo.$gte = new Date(fechaDesde as string);
            if (fechaHasta) matchCabecera.periodo.$lte = new Date(fechaHasta as string);
        }

        if (estado === 'cerrada') matchCabecera.fechaCierre = { $ne: null };
        if (estado === 'abierta') matchCabecera.fechaCierre = { $eq: null };

        const resultado = await EvaluacionDetalleModel.aggregate([
            { $match: matchDetalle },
            {
                $lookup: {
                    from: 'planilla_evaluacion_cabecera',
                    localField: 'idPlanillaEvaluacionCabecera',
                    foreignField: '_id',
                    as: 'cabecera'
                }
            },
            { $unwind: '$cabecera' },
            { $match: matchCabecera },
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
            { $sort: { "agenteEvaluado.nombreAgenteEvaluado": 1 } }
        ]);

        return successResponse(res, {
            total: resultado.length,
            data: resultado
        });

    } catch {
        return errorResponse(res, 'Error Agentes evaluados con filtros', 500);
    }
});

//  Contar items con valor > 0
router.get('/evaluacionItems/contar-items-valor/:idPlanillaEvaluacionCabecera/:idAgente', verifyToken, async (req, res) => {
    try {
        const { idPlanillaEvaluacionCabecera, idAgente } = req.params;
        if (!validarIds(idPlanillaEvaluacionCabecera, idAgente, res)) return;

        const resultado = await EvaluacionDetalleModel.aggregate([
            {
                $match: {
                    idPlanillaEvaluacionCabecera: new mongoose.Types.ObjectId(idPlanillaEvaluacionCabecera),
                    "agenteEvaluado.idAgenteEvaluado": new mongoose.Types.ObjectId(idAgente)
                }
            },
            { $unwind: "$categorias" },
            { $unwind: "$categorias.items" },
            { $match: { "categorias.items.puntaje": { $gt: 0 } } },
            { $count: "totalItemsConValor" }
        ]);

        const totalItems = resultado[0]?.totalItemsConValor ?? 0;

        return successResponse(res, { totalItems });

    } catch {
        return errorResponse(res, 'Error Contar items con valor > 0', 500);
    }
});

//  Suma y promedio
router.get('/evaluacionItems/sumaPromediaPuntajes/:idPlanillaEvaluacionCabecera/:idAgente', verifyToken, async (req, res) => {
    try {
        const { idPlanillaEvaluacionCabecera, idAgente } = req.params;
        if (!validarIds(idPlanillaEvaluacionCabecera, idAgente, res)) return;

        const resultado = await EvaluacionDetalleModel.aggregate([
            {
                $match: {
                    idPlanillaEvaluacionCabecera: new mongoose.Types.ObjectId(idPlanillaEvaluacionCabecera),
                    "agenteEvaluado.idAgenteEvaluado": new mongoose.Types.ObjectId(idAgente)
                }
            },
            { $unwind: "$categorias" },
            { $unwind: "$categorias.items" },
            { $match: { "categorias.items.puntaje": { $gt: 0 } } },
            {
                $group: {
                    _id: null,
                    sumaPuntajes: { $sum: "$categorias.items.puntaje" },
                    cantidad: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    sumaPuntajes: 1,
                    cantidad: 1,
                    promedio: { $divide: ["$sumaPuntajes", "$cantidad"] }
                }
            }
        ]);

        const data = resultado[0] ?? { sumaPuntajes: 0, cantidad: 0, promedio: 0 };

        return successResponse(res, data);

    } catch {
        return errorResponse(res, 'Error Suma y promedio', 500);
    }
});

// Totales simples
router.get('/evaluacionItems/totales/:idPlanillaEvaluacionCabecera/:idAgente', verifyToken, async (req, res) => {
    try {
        const { idPlanillaEvaluacionCabecera, idAgente } = req.params;
        if (!validarIds(idPlanillaEvaluacionCabecera, idAgente, res)) return;

        const resultado = await EvaluacionDetalleModel.aggregate([
            {
                $match: {
                    idPlanillaEvaluacionCabecera: new mongoose.Types.ObjectId(idPlanillaEvaluacionCabecera),
                    "agenteEvaluado.idAgenteEvaluado": new mongoose.Types.ObjectId(idAgente)
                }
            },
            { $unwind: "$categorias" },
            { $unwind: "$categorias.items" },
            {
                $group: {
                    _id: null,
                    totalItems: { $sum: 1 },
                    totalPuntaje: { $sum: "$categorias.items.puntaje" }
                }
            },
            { $project: { _id: 0, totalItems: 1, totalPuntaje: 1 } }
        ]);

        const totales = resultado[0] ?? { totalItems: 0, totalPuntaje: 0 };

        return successResponse(res, totales);

    } catch {
        return errorResponse(res, 'Error Totales simples', 500);
    }
});

export const evaluacionResultadosRouter = router;
