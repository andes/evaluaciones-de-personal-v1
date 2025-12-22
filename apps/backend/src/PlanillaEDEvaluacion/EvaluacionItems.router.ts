import { Router, Request, Response } from 'express';
import { EvaluacionDetalleModel } from './EvaluacionDetalle.schema';
import * as mongoose from 'mongoose';

const router = Router();

router.put('/actualizar-puntaje', async (req: Request, res: Response) => {
    try {


        const { idPlanillaEvaluacionCabecera, idAgenteEvaluado, idItem, nuevoPuntaje } = req.body;



        // Validación de IDs
        if (
            !mongoose.Types.ObjectId.isValid(idPlanillaEvaluacionCabecera) ||
            !mongoose.Types.ObjectId.isValid(idAgenteEvaluado) ||
            !mongoose.Types.ObjectId.isValid(idItem)
        ) {
            console.warn('❌ Uno o más IDs son inválidos:', {
                idPlanillaEvaluacionCabecera,
                idAgenteEvaluado,
                idItem
            });
            return res.status(400).json({ success: false, message: 'Uno o más IDs son inválidos' });
        }

        // Convertir a ObjectId
        const idCabObj = new mongoose.Types.ObjectId(idPlanillaEvaluacionCabecera);
        const idAgenteObj = new mongoose.Types.ObjectId(idAgenteEvaluado);
        const idItemObj = new mongoose.Types.ObjectId(idItem);

        // Buscar evaluación
        const evaluacion = await EvaluacionDetalleModel.findOne({
            idPlanillaEvaluacionCabecera: idCabObj,
            'agenteEvaluado.idAgenteEvaluado': idAgenteObj
        });

        if (!evaluacion) {
            console.warn('❌ Evaluación no encontrada');
            return res.status(404).json({ success: false, message: 'Evaluación no encontrada' });
        }

        // Buscar el ítem en categorías
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
            console.warn('❌ Ítem no encontrado en evaluación');
            return res.status(404).json({ success: false, message: 'Ítem no encontrado en evaluación' });
        }

        // Guardar cambios
        await evaluacion.save();


        return res.status(200).json({
            success: true,
            message: 'Puntaje actualizado correctamente',
            item: itemActualizado
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: 'Error interno al actualizar puntaje',
            error
        });
    }
});

// Ruta de prueba simple
router.put('/test', (req: Request, res: Response) => {

    res.json({ recibido: req.body });
});

export default router;
