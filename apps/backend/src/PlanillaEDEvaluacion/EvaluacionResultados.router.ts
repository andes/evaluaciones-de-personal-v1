import { Router, Request, Response } from 'express';
import { EvaluacionDetalleModel } from './EvaluacionDetalle.schema';
import * as mongoose from 'mongoose';

const router = Router();

//  Filtrar por cabecera y agente
function validarIds(idCabecera: string, idAgente: string, res: Response) {
    if (!mongoose.Types.ObjectId.isValid(idCabecera) || !mongoose.Types.ObjectId.isValid(idAgente)) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return false;
    }
    return true;
}

// Cantidad de items por idCabecera e idAgente
router.get('/agentes-evaluados', async (req: Request, res: Response) => {
    try {
        const {
            idAgenteEvaluado,
            idAgenteEvaluador,
            fechaDesde,
            fechaHasta,
            estado // abierta | cerrada
        } = req.query;

        const matchDetalle: any = {};
        const matchCabecera: any = {};

        // 🔎 Filtros dinámicos
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

        if (estado === 'cerrada') {
            matchCabecera.fechaCierre = { $ne: null };
        }

        if (estado === 'abierta') {
            matchCabecera.fechaCierre = { $eq: null };
        }

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

        return res.status(200).json({
            success: true,
            total: resultado.length,
            data: resultado
        });

    } catch (error) {
        console.error('Error agentes-evaluados:', error);
        return res.status(500).json({ success: false, message: 'Error interno' });
    }
});


// Cantidad de items con valor > 0
router.get('/evaluacionItems/contar-items-valor/:idPlanillaEvaluacionCabecera/:idAgente', async (req: Request, res: Response) => {
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

        const totalItems = resultado.length > 0 ? resultado[0].totalItemsConValor : 0;
        return res.status(200).json({ success: true, totalItems });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error interno', error });
    }
});

// Suma y promedio de puntajes
router.get('/evaluacionItems/sumaPromediaPuntajes/:idPlanillaEvaluacionCabecera/:idAgente', async (req: Request, res: Response) => {
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
            { $group: { _id: null, sumaPuntajes: { $sum: "$categorias.items.puntaje" }, cantidad: { $sum: 1 } } },
            { $project: { _id: 0, sumaPuntajes: 1, cantidad: 1, promedio: { $divide: ["$sumaPuntajes", "$cantidad"] } } }
        ]);

        if (resultado.length === 0) {
            return res.status(200).json({ success: true, sumaPuntajes: 0, cantidad: 0, promedio: 0 });
        }

        return res.status(200).json({
            success: true,
            sumaPuntajes: resultado[0].sumaPuntajes,
            cantidad: resultado[0].cantidad,
            promedio: resultado[0].promedio
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error interno', error });
    }
});

// Totales simples (items y suma de puntajes)
router.get('/evaluacionItems/totales/:idPlanillaEvaluacionCabecera/:idAgente', async (req: Request, res: Response) => {
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
            { $group: { _id: null, totalItems: { $sum: 1 }, totalPuntaje: { $sum: "$categorias.items.puntaje" } } },
            { $project: { _id: 0, totalItems: 1, totalPuntaje: 1 } }
        ]);

        const totales = resultado.length > 0 ? resultado[0] : { totalItems: 0, totalPuntaje: 0 };
        return res.status(200).json({ success: true, ...totales });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error interno', error });
    }
});

export const evaluacionResultadosRouter = router;
