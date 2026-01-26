import { Router, Request, Response } from 'express';
import * as mongoose from 'mongoose';
import { PlanillaEvaluacionCabeceraModel } from '../PlanillaEDEvaluacion/EvaluacionCabecera.schema';
import { EvaluacionDetalleModel } from './EvaluacionDetalle.schema';

const router = Router();



// grilla resumen
router.get('/evaluaciones-resumen', async (_req: Request, res: Response) => {
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

        res.status(200).json({ success: true, total: data.length, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

// todas las evaluaciones
router.get('/evaluacioneslisttodas', async (_req: Request, res: Response) => {
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

        res.status(200).json({ success: true, total: data.length, data });
    } catch {
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});




router.get('/buscar-agente', async (req: Request, res: Response) => {
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

        res.status(200).json({ success: true, total: data.length, data });
    } catch {
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

router.get('/buscar-evaluador', async (req: Request, res: Response) => {
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

        res.status(200).json({ success: true, total: data.length, data });
    } catch {
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});




// por agente
router.get('/evaluaciones/por-agente/:idAgente', async (req, res) => {
    const { idAgente } = req.params;

    if (!mongoose.Types.ObjectId.isValid(idAgente)) {
        return res.status(400).json({ success: false, message: 'ID inválido' });
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
        {
            $match: {
                'agenteEvaluado.idAgenteEvaluado': new mongoose.Types.ObjectId(idAgente)
            }
        }
    ]);

    res.status(200).json({ success: true, total: data.length, data });
});

// por tipo de cierre
router.get('/por-tipo-cierre/:idTipoCierre', async (req, res) => {
    const { idTipoCierre } = req.params;

    if (!mongoose.Types.ObjectId.isValid(idTipoCierre)) {
        return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const data = await EvaluacionDetalleModel.find({
        'tipoCierreEvaluacion.idTipoCierreEvaluacion':
            new mongoose.Types.ObjectId(idTipoCierre)
    });

    res.status(200).json({ success: true, total: data.length, data });
});

// evaluación completa
router.get('/evaluacion-completa/:idCabecera', async (req, res) => {
    const { idCabecera } = req.params;

    if (!mongoose.Types.ObjectId.isValid(idCabecera)) {
        return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const cabecera = await PlanillaEvaluacionCabeceraModel.findById(idCabecera).lean();
    if (!cabecera) {
        return res.status(404).json({ success: false, message: 'Cabecera no encontrada' });
    }

    const detalles = await EvaluacionDetalleModel.find({
        idPlanillaEvaluacionCabecera: idCabecera
    })
        .populate('categorias.idCategoria', 'descripcionCategoria')
        .populate('categorias.items.idItem', 'descripcion')
        .lean();

    res.status(200).json({ success: true, cabecera, detalles });
});

export default router;
