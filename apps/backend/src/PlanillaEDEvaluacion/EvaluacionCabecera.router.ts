import { Router, Request, Response } from 'express';
import { PlanillaEvaluacionCabeceraModel } from '../PlanillaEDEvaluacion/EvaluacionCabecera.schema';
import * as mongoose from 'mongoose';
import { ServicioModel } from '../comunes/Servicios/Schemas/servicios';
import { EfectorModel } from '../comunes/Efectores/schemas/efectores';
import { verifyToken } from '../auth/auth.middleware';
import { successResponse, errorResponse } from '../Utilidades/apiResponse';

const router = Router();

router.post('/planillaedcabecera', verifyToken, async (req: Request, res: Response) => {
    try {
        const { periodo, agenteevaluador, Efector, Servicio, usuario } = req.body;

        if (!periodo || !agenteevaluador || !Efector || !Servicio || !usuario) {
            return errorResponse(res, 'Faltan campos requeridos', 400);
        }

        const efectorDB = await EfectorModel.findById(Efector.idEfector).lean();
        const servicioDB = await ServicioModel.findById(Servicio.idServicio).lean();

        const nuevaCabecera = new PlanillaEvaluacionCabeceraModel({
            periodo: new Date(periodo),
            agenteevaluador: {
                idUsuarioEvaluador: agenteevaluador.idUsuarioEvaluador,
                nombreUsuarioEvaluador: agenteevaluador.nombreUsuarioEvaluador
            },
            Efector: {
                idEfector: Efector.idEfector,
                nombre: efectorDB?.nombre ?? 'Desconocido'
            },
            Servicio: {
                idServicio: Servicio.idServicio,
                nombre: servicioDB?.descripcion ?? 'Desconocido'
            },
            fechaCierre: new Date('1900-01-01'),
            usuario,
            fechaMod: new Date(),
            tipoCierreEvaluacion: {
                id: new mongoose.Types.ObjectId("688240f09cca123543c84b04"),
                nombre: "Evaluación Abierta"
            }
        });

        const cabeceraGuardada = await nuevaCabecera.save();

        return successResponse(res, cabeceraGuardada, 'Cabecera creada', 201);

    } catch {
        return errorResponse(res, 'Error al crear cabecera', 500);
    }
});

router.post('/planillaedcabecera/existe', verifyToken, async (req: Request, res: Response) => {
    try {
        const { periodo, agenteevaluador, Efector, Servicio } = req.body;

        if (!periodo || !agenteevaluador || !Efector || !Servicio) {
            return errorResponse(res, 'Faltan campos requeridos', 400);
        }

        const existeCabecera = await PlanillaEvaluacionCabeceraModel.findOne({
            periodo: new Date(periodo),
            'agenteevaluador.idUsuarioEvaluador': new mongoose.Types.ObjectId(agenteevaluador.idUsuarioEvaluador),
            'Efector.idEfector': Efector.idEfector,
            'Servicio.idServicio': Servicio.idServicio
        });

        return successResponse(res, {
            existe: !!existeCabecera,
            data: existeCabecera || null
        });

    } catch {
        return errorResponse(res, 'Error al verificar cabecera', 500);
    }
});

router.get('/planillaedcabecera/buscar', verifyToken, async (req: Request, res: Response) => {
    try {
        const { idUsuarioEvaluador } = req.query;

        if (!idUsuarioEvaluador) {
            return errorResponse(res, 'Falta idUsuarioEvaluador', 400);
        }

        const cabeceras = await PlanillaEvaluacionCabeceraModel.find({
            'agenteevaluador.idUsuarioEvaluador': new mongoose.Types.ObjectId(idUsuarioEvaluador as string)
        }).sort({ periodo: 1 });

        return successResponse(res, {
            total: cabeceras.length,
            data: cabeceras
        });

    } catch {
        return errorResponse(res, 'Error al buscar cabeceras', 500);
    }
});

router.get('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'ID inválido', 400);
        }

        const cabecera = await PlanillaEvaluacionCabeceraModel.findById(id);
        if (!cabecera) return errorResponse(res, 'Cabecera no encontrada', 404);

        return successResponse(res, cabecera);

    } catch {
        return errorResponse(res, 'Error interno', 500);
    }
});

router.delete('/evaluacioncabecera/:id', verifyToken, async (req, res) => {
    try {
        const cabeceraEliminada = await PlanillaEvaluacionCabeceraModel.findByIdAndDelete(req.params.id);

        if (!cabeceraEliminada) {
            return errorResponse(res, 'Cabecera no encontrada', 404);
        }

        return successResponse(res, null, 'Cabecera eliminada');

    } catch {
        return errorResponse(res, 'Error al eliminar', 500);
    }
});

router.delete('/evaluacioncabecera', verifyToken, async (_req: Request, res: Response) => {
    try {
        const resultado = await PlanillaEvaluacionCabeceraModel.deleteMany({});

        return successResponse(res, {
            deleted: resultado.deletedCount
        }, 'Cabeceras eliminadas');

    } catch {
        return errorResponse(res, 'Error al eliminar', 500);
    }
});

router.get('/', verifyToken, async (_req: Request, res: Response) => {
    try {
        const cabeceras = await PlanillaEvaluacionCabeceraModel.find();
        return successResponse(res, cabeceras);
    } catch {
        return errorResponse(res, 'Error al obtener cabeceras', 500);
    }
});

export default router;
