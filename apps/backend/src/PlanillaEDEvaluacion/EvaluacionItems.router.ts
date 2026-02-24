import { Router, Request, Response } from 'express';
import { EvaluacionDetalleModel } from './EvaluacionDetalle.schema';
import * as mongoose from 'mongoose';
import { verifyToken } from '../auth/auth.middleware';
import { successResponse, errorResponse } from '../Utilidades/apiResponse';

const router = Router();

router.put('/actualizar-puntaje', verifyToken, async (req: Request, res: Response) => {
    try {
        const { idPlanillaEvaluacionCabecera, idAgenteEvaluado, idItem, nuevoPuntaje } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(idPlanillaEvaluacionCabecera) ||
            !mongoose.Types.ObjectId.isValid(idAgenteEvaluado) ||
            !mongoose.Types.ObjectId.isValid(idItem)
        ) {
            return errorResponse(res, 'Uno o más IDs son inválidos', 400);
        }

        const idCabObj = new mongoose.Types.ObjectId(idPlanillaEvaluacionCabecera);
        const idAgenteObj = new mongoose.Types.ObjectId(idAgenteEvaluado);
        const idItemObj = new mongoose.Types.ObjectId(idItem);

        const evaluacion = await EvaluacionDetalleModel.findOne({
            idPlanillaEvaluacionCabecera: idCabObj,
            'agenteEvaluado.idAgenteEvaluado': idAgenteObj
        });

        if (!evaluacion) {
            return errorResponse(res, 'Evaluación no encontrada', 404);
        }

        let itemActualizado = null;

        for (const categoria of evaluacion.categorias) {
            const item = categoria.items.find(i => i.idItem && i.idItem.equals(idItemObj));
            if (item) {
                item.puntaje = nuevoPuntaje;
                itemActualizado = item;
                break;
            }
        }

        if (!itemActualizado) {
            return errorResponse(res, 'Ítem no encontrado en evaluación', 404);
        }

        await evaluacion.save();

        return successResponse(
            res,
            { item: itemActualizado },
            'Puntaje actualizado correctamente'
        );

    } catch {
        return errorResponse(res, 'Error interno al actualizar puntaje', 500);
    }
});

router.put('/test', verifyToken, (req: Request, res: Response) => {
    return successResponse(res, { recibido: req.body });
});

export default router;
