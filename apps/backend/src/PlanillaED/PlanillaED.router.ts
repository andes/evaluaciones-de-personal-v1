import { Router, Request, Response } from 'express';
import { PlanillaEDModel } from '../PlanillaED/PlanillaED.schema';
import { ItemModel } from '../comunes/items/items.schema';
import mongoose from 'mongoose';

const router = Router();

/* ============================================================
   RUTAS DE BÚSQUEDA
============================================================ */

// Buscar por efector y servicio
router.get('/buscar-por-efector-servicio', async (req: Request, res: Response) => {
    try {
        let { idEfector, idServicio } = req.query;

        if (!mongoose.Types.ObjectId.isValid(String(idEfector)) ||
            !mongoose.Types.ObjectId.isValid(String(idServicio))) {
            return res.status(400).json({ message: 'IDs inválidos' });
        }

        const planilla = await PlanillaEDModel.findOne({
            idEfector,
            idServicio
        })
            .populate('idEfector', 'nombre')
            .populate('idServicio', 'nombre')
            .populate('categorias.categoria', 'descripcion')
            .lean();

        if (!planilla) return res.status(404).json({ message: 'Planilla no encontrada' });

        res.json(planilla);
    } catch (error) {
        res.status(500).json({ message: 'Error interno', error });
    }
});

// Buscar por tipo evaluación
router.get('/buscar-por-tipo-evaluacion/:idTipoEvaluacion', async (req: Request, res: Response) => {
    try {
        const { idTipoEvaluacion } = req.params;

        if (!mongoose.Types.ObjectId.isValid(idTipoEvaluacion)) {
            return res.status(400).json({ message: 'ID de tipo de evaluación inválido' });
        }

        const planilla = await PlanillaEDModel.findOne({
            'tipoEvaluacion.idTipoEvaluacion': idTipoEvaluacion
        })
            .populate('idEfector', 'nombre')
            .populate('idServicio', 'nombre')
            .populate('categorias.categoria', 'descripcion')
            .lean();

        if (!planilla) {
            return res.status(404).json({
                message: 'No se encontró planilla para ese tipo de evaluación'
            });
        }

        res.json(planilla);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar por tipoEvaluacion', error });
    }
});



// Obtener categorías
router.get('/:id/categorias', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const planilla: any = await PlanillaEDModel
            .findById(id)
            .populate('categorias.categoria')
            .lean();

        if (!planilla) return res.status(404).json({ message: 'Planilla no encontrada' });

        const resumen = (planilla.categorias || []).map((cat: any) => ({
            id: cat?.categoria?._id ?? null,
            descripcion: cat?.categoria?.descripcion ?? '',
            totalItems: Array.isArray(cat?.items) ? cat.items.length : 0
        }));

        return res.json({
            planillaId: id,
            descripcion: planilla.descripcion,
            categorias: resumen
        });

    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener categorías', error });
    }
});

// Ítems disponibles
router.get('/:idDocumento/items-disponibles', async (req: Request, res: Response) => {
    try {
        const { idDocumento } = req.params;

        const planilla: any = await PlanillaEDModel.findById(idDocumento).lean();
        if (!planilla) return res.status(404).json({ message: 'Planilla no encontrada' });

        const usados: string[] = planilla.categorias
            .flatMap((cat: any) =>
                (cat.items || []).map((item: any) => String(item._id))
            );

        const disponibles = await ItemModel.find({ _id: { $nin: usados } })
            .sort({ descripcion: 1 })
            .lean();

        return res.json({
            items: disponibles.map((i: any) => ({
                _id: String(i._id),
                descripcion: i.descripcion,
                valor: i.valor
            }))
        });

    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener items', error });
    }
});

// Verificar existencia de ítem (RUTA ESPECÍFICA — DEBE IR ANTES DEL :id)
router.get('/:idPlanilla/items/existe', async (req: Request, res: Response) => {
    try {
        const { idPlanilla } = req.params;
        const { itemDesc } = req.query;


        if (!itemDesc || typeof itemDesc !== 'string') {
            return res.status(400).json({
                message: 'Parámetro itemDesc requerido y debe ser string'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(idPlanilla)) {
            return res.status(400).json({ message: 'ID de planilla inválido' });
        }

        const planilla = await PlanillaEDModel.findById(idPlanilla).lean();
        if (!planilla) {
            return res.status(404).json({ message: 'Planilla no encontrada' });
        }

        if (!Array.isArray(planilla.categorias)) {
            return res.json({ exists: false });
        }

        const normalizedDesc = itemDesc.toLowerCase().trim();
        let exists = false;

        for (const cat of planilla.categorias) {
            if (!Array.isArray(cat.items)) continue;

            for (const item of cat.items) {
                if (typeof item.descripcion !== 'string') continue;
                if (item.descripcion.toLowerCase().trim() === normalizedDesc) {
                    exists = true;
                    break;
                }
            }
            if (exists) break;
        }


        return res.json({ exists });

    } catch (error) {
        console.error("🔥 ERROR verificando ítem:", error);
        return res.status(500).json({
            message: 'Error al verificar ítem',
            error: error instanceof Error ? error.message : error
        });
    }
});

// Eliminar item
router.delete('/eliminar-item', async (req: Request, res: Response) => {
    try {
        const { idDocumento, descripcionItem } = req.body;

        if (!idDocumento || !descripcionItem) {
            return res.status(400).json({ message: 'Faltan parámetros' });
        }

        const result = await PlanillaEDModel.findOneAndUpdate(
            { _id: idDocumento },
            { $pull: { 'categorias.$[].items': { descripcion: descripcionItem } } },
            { new: true }
        );

        if (!result) return res.status(404).json({ message: 'Documento no encontrado' });

        res.json({ message: 'Ítem eliminado', resultado: result });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar ítem', error });
    }
});




router.get('/', async (_req: Request, res: Response) => {
    try {
        const planillas = await PlanillaEDModel.find()
            .populate('categorias.categoria')
            .populate('idEfector', 'nombre')
            .populate('idServicio', 'nombre')
            .lean();

        planillas.forEach(p => {
            if (Array.isArray(p.categorias)) {
                p.categorias.sort((a, b) => a.descripcion.localeCompare(b.descripcion));
            }
        });

        res.json(planillas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener planillas', error });
    }
});


router.get('/:planillaId/categorias/:categoriaId/items', async (req: Request, res: Response) => {
    try {
        const { planillaId, categoriaId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(planillaId) || !mongoose.Types.ObjectId.isValid(categoriaId)) {
            return res.status(400).json({ message: 'IDs inválidos' });
        }

        const planilla: any = await PlanillaEDModel.findById(planillaId)
            .populate('categorias.categoria')
            .lean();

        if (!planilla) return res.status(404).json({ message: 'Planilla no encontrada' });

        const categoria = planilla.categorias.find((cat: any) => String(cat.categoria._id) === categoriaId);

        if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada en la planilla' });

        res.json({
            planillaId,
            categoriaId,
            items: categoria.items || []
        });
    } catch (error) {
        console.error('Error al obtener items por planilla y categoría:', error);
        res.status(500).json({ message: 'Error interno', error });
    }
});


// Crear planilla
router.post('/', async (req: Request, res: Response) => {
    try {


        const { descripcion, tipoEvaluacion } = req.body;



        // 🔍 CONTROLAR QUE YA EXISTA UNA PLANILLA PARA ESE TIPO
        const existe = await PlanillaEDModel.findOne({
            "tipoEvaluacion.idTipoEvaluacion": tipoEvaluacion.idTipoEvaluacion
        });

        if (existe) {
            return res.status(400).json({
                message: 'Ya existe una planilla para este Tipo de Evaluación'
            });
        }

        // 🔹 CREAR NUEVA PLANILLA
        const nueva = new PlanillaEDModel({
            descripcion,
            fechaCreacion: new Date(),
            tipoEvaluacion,
            categorias: []
        });



        const guardada = await nueva.save();
        res.status(201).json(guardada);

    } catch (error: any) {
        console.error("❌ ERROR AL CREAR:", error);
        res.status(500).json({
            message: 'Planilla ya existe',
            error: error.message,
            errorCompleto: error
        });
    }
});




// Actualizar planilla
router.put('/:id/categorias', async (req: Request, res: Response) => {
    try {
        const { categoria, descripcionCategoria, items } = req.body;
        const { id } = req.params;

        const planilla = await PlanillaEDModel.findById(id);
        if (!planilla) return res.status(404).json({ message: 'Planilla no encontrada' });

        const existente = planilla.categorias.find(cat => String(cat.categoria) === String(categoria));

        if (existente) {
            existente.descripcion = descripcionCategoria;

            const nuevos = items.filter((item: { _id?: string; idItem?: string; descripcion: string; valor: any }) =>
                !existente.items.some(i => i.descripcion === item.descripcion)
            );

            if (nuevos.length > 0) {
                existente.items.push(...nuevos.map((item: { _id?: string; idItem?: string; descripcion: string; valor: any }) => ({
                    _id: item._id || item.idItem,
                    descripcion: item.descripcion,
                    valor: item.valor
                })));
                planilla.markModified('categorias');
            }
        } else planilla.categorias.push({
            categoria,
            descripcion: descripcionCategoria,
            items: items.map((item: any) => ({
                _id: item._id || item.idItem,
                descripcion: item.descripcion,
                valor: item.valor
            }))
        });


        await planilla.save();
        res.json({ message: 'Planilla actualizada', planilla });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar', error });
    }
});

// Eliminar todas
router.delete('/', async (_req: Request, res: Response) => {
    try {
        const result = await PlanillaEDModel.deleteMany({});
        res.json({
            message: 'Planillas eliminadas',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar planillas', error });
    }
});

// Obtener una planilla (GENÉRICA - ÚLTIMA SIEMPRE)
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const planilla = await PlanillaEDModel.findById(req.params.id)
            .populate('idEfector', 'nombre')
            .populate('idServicio', 'nombre')
            .populate('categorias.categoria', 'descripcion')
            .lean();

        if (!planilla) return res.status(404).json({ message: 'Planilla no encontrada' });

        res.json(planilla);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener planilla', error });
    }
});

export default router;
