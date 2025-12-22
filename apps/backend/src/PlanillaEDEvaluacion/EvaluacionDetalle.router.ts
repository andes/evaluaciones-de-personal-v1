import { Router, Request, Response } from 'express';
import { EvaluacionDetalleModel } from './EvaluacionDetalle.schema';
import { ItemModel } from '../comunes/items/items.schema';
import * as mongoose from 'mongoose';

const router = Router();

type AgenteSimple = {
    idAgenteEvaluado: string;
    nombreAgenteEvaluado: string;
    legajo: string;
};

// 1) Verificar si existe evaluación por cabecera y agente
router.get('/existe/:idCabecera/:idAgente', async (req: Request, res: Response) => {
    try {
        const { idCabecera, idAgente } = req.params;

        if (!mongoose.Types.ObjectId.isValid(idCabecera) || !mongoose.Types.ObjectId.isValid(idAgente)) {
            return res.status(400).json({ success: false, message: 'IDs inválidos' });
        }

        const existe = await EvaluacionDetalleModel.exists({
            idPlanillaEvaluacionCabecera: idCabecera,
            'agenteEvaluado.idAgenteEvaluado': idAgente
        });

        return res.status(200).json({ success: true, existe: !!existe });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error interno al verificar existencia' });
    }
});

// 2) Obtener todas las evaluaciones de una cabecera
router.get('/por-cabecera/:idCabecera', async (req: Request, res: Response) => {
    try {
        const { idCabecera } = req.params;

        if (!mongoose.Types.ObjectId.isValid(idCabecera)) {
            return res.status(400).json({ success: false, message: 'ID de cabecera inválido' });
        }

        const evaluaciones = await EvaluacionDetalleModel.find({
            idPlanillaEvaluacionCabecera: idCabecera
        })
            .populate({ path: 'categorias.idCategoria', select: 'descripcionCategoria' })
            .populate({ path: 'categorias.items.idItem', select: 'descripcion' })
            .lean();

        return res.status(200).json({ success: true, data: evaluaciones });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error interno al obtener evaluaciones',
            error: (error as Error).message
        });
    }
});

// 3) Obtener agentes de una cabecera
router.get('/por-cabecera/:idCabecera/agentes', async (req: Request, res: Response) => {
    try {
        const { idCabecera } = req.params;

        if (!mongoose.Types.ObjectId.isValid(idCabecera)) {
            return res.status(400).json({ success: false, message: 'ID de cabecera inválido' });
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


        const lista = agentes
            .map(a => a.agenteEvaluado)
            .filter(Boolean);

        return res.status(200).json({ success: true, data: lista });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error interno al obtener agentes',
            error: (error as Error).message
        });
    }
});

// 4) Obtener categorías e ítems de un agente en una evaluación
router.get('/categorias-items/:idEvaluacion/:idAgente', async (req: Request, res: Response) => {
    try {
        const { idEvaluacion, idAgente } = req.params;

        if (!mongoose.Types.ObjectId.isValid(idEvaluacion) || !mongoose.Types.ObjectId.isValid(idAgente)) {
            return res.status(400).json({ success: false, message: 'IDs inválidos' });
        }

        const evaluacion = await EvaluacionDetalleModel.findOne({
            idPlanillaEvaluacionCabecera: idEvaluacion,
            'agenteEvaluado.idAgenteEvaluado': idAgente
        }).lean();

        if (!evaluacion) {
            return res.status(404).json({ success: false, message: 'Evaluación no encontrada' });
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

        return res.status(200).json({ success: true, data: categorias });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al obtener categorías e ítems',
            error: (error as Error).message
        });
    }
});

// 5) Corregir IDs de ítems
router.put('/corregir-items/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'ID inválido' });
        }

        const evaluacion = await EvaluacionDetalleModel.findById(id);
        if (!evaluacion) {
            return res.status(404).json({ success: false, message: 'Evaluación no encontrada' });
        }

        for (const categoria of evaluacion.categorias) {
            for (const item of categoria.items) {
                const itemReal = await ItemModel.findOne({ descripcion: item.descripcion });
                if (itemReal) item.idItem = itemReal._id;
            }
        }

        await evaluacion.save();
        res.status(200).json({ success: true, message: 'IDs de ítems corregidos exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error interno al corregir ítems', error });
    }
});

// 6) ACTUALIZAR TIPO DE CIERRE (TU RUTA IMPORTANTE)
router.put('/:idCabecera/agente/:idAgente/tipo-cierreCabecera', async (req: Request, res: Response) => {
    try {
        const { idCabecera, idAgente } = req.params;
        const { tipoCierreEvaluacion } = req.body;

        if (!mongoose.Types.ObjectId.isValid(idCabecera) || !mongoose.Types.ObjectId.isValid(idAgente)) {
            return res.status(400).json({ success: false, message: 'IDs inválidos' });
        }

        if (!tipoCierreEvaluacion?.idTipoCierreEvaluacion) {
            return res.status(400).json({ success: false, message: 'Datos de tipo de cierre incompletos' });
        }

        const evaluacion = await EvaluacionDetalleModel.findOne({
            idPlanillaEvaluacionCabecera: idCabecera,
            'agenteEvaluado.idAgenteEvaluado': idAgente
        });

        if (!evaluacion) {
            return res.status(404).json({ success: false, message: 'Evaluación no encontrada' });
        }

        evaluacion.tipoCierreEvaluacion = {
            idTipoCierreEvaluacion: tipoCierreEvaluacion.idTipoCierreEvaluacion,
            nombreTipoCierreEvaluacion: tipoCierreEvaluacion.nombreTipoCierreEvaluacion ?? '',
            detalle: tipoCierreEvaluacion.detalle ?? '',
            descripcion: tipoCierreEvaluacion.descripcion ?? '',
            fechaCierre: new Date()
        };

        await evaluacion.save();

        return res.status(200).json({
            success: true,
            message: 'Tipo de cierre actualizado correctamente',
            data: evaluacion
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al actualizar tipo de cierre',
            error: (error as Error).message
        });
    }
});

/* ---------------------------------------------
   🔹 RUTAS GENERALES (AL FINAL)
--------------------------------------------- */

// Crear evaluación
router.post('/', async (req: Request, res: Response) => {
    try {
        const { _id, idPlanillaEvaluacionCabecera, agenteEvaluado, categorias } = req.body;

        if (!idPlanillaEvaluacionCabecera || !agenteEvaluado?.idAgenteEvaluado) {
            return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
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
                idTipoCierreEvaluacion: '688240f09cca123543c84b04',
                nombreTipoCierreEvaluacion: 'Evaluación Abierta',
                detalle: 'Evaluación Abierta',
                fechaCierre: new Date(),
                descripcion: ''
            },
            categorias: categoriasT
        });

        const guardada = await nueva.save();
        res.status(201).json({
            success: true,
            data: guardada,
            message: 'Evaluación creada exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al crear evaluación',
            error
        });
    }
});

// Obtener evaluación por ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'ID inválido' });
        }

        const evaluacion = await EvaluacionDetalleModel.findById(id)
            .populate({ path: 'categorias.idCategoria', select: 'descripcionCategoria' })
            .populate({ path: 'categorias.items.idItem', select: 'descripcion' })
            .lean();

        if (!evaluacion) {
            return res.status(404).json({ success: false, message: 'Evaluación no encontrada' });
        }

        res.status(200).json({ success: true, data: evaluacion });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener evaluación',
            error
        });
    }
});

// Actualizar evaluación completa
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'ID inválido' });
        }

        const actualizada = await EvaluacionDetalleModel.findByIdAndUpdate(id, req.body, { new: true });

        if (!actualizada) {
            return res.status(404).json({ success: false, message: 'Evaluación no encontrada' });
        }

        res.status(200).json({
            success: true,
            data: actualizada,
            message: 'Evaluación actualizada exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar evaluación',
            error
        });
    }
});

// Eliminar evaluación por ID
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'ID inválido' });
        }

        const eliminada = await EvaluacionDetalleModel.findByIdAndDelete(id);

        if (!eliminada) {
            return res.status(404).json({ success: false, message: 'Evaluación no encontrada' });
        }

        res.status(200).json({ success: true, message: 'Evaluación eliminada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar evaluación',
            error
        });
    }
});

// Eliminar todas las evaluaciones
router.delete('/', async (req: Request, res: Response) => {
    try {
        const result = await EvaluacionDetalleModel.deleteMany({});

        res.status(200).json({
            success: true,
            message: 'Todas las evaluaciones fueron eliminadas',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar todas las evaluaciones',
            error
        });
    }
});

export default router;
