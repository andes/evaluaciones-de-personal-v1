import { Router, Request, Response } from 'express';
import { TipoEvaluacionModel } from './TipoEvaluacion.schema';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const tipos = await TipoEvaluacionModel.find().sort({ nombre: 1 });
        return res.json(tipos);
    } catch (error) {
        console.error('❌ Error al obtener los tipos de evaluación:', error);
        return res.status(500).json({ error: 'Error al obtener los tipos de evaluación' });
    }
});


router.post('/', async (req: Request, res: Response) => {
    try {
        // Validar campo obligatorio
        if (!req.body.nombre || req.body.nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre es obligatorio' });
        }

        const nuevoTipo = new TipoEvaluacionModel(req.body);
        const guardado = await nuevoTipo.save();

        return res.status(201).json(guardado);
    } catch (error) {
        console.error('❌ Error al crear tipo de evaluación:', error);
        return res.status(400).json({ error: 'Error al crear el tipo de evaluación' });
    }
});


router.put('/:id', async (req: Request, res: Response) => {
    try {
        const actualizado = await TipoEvaluacionModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!actualizado) {
            return res.status(404).json({ error: 'Tipo de evaluación no encontrado' });
        }

        return res.json(actualizado);
    } catch (error) {
        console.error('❌ Error al actualizar tipo de evaluación:', error);
        return res.status(400).json({ error: 'Error al actualizar el tipo de evaluación' });
    }
});


router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const eliminado = await TipoEvaluacionModel.findByIdAndDelete(req.params.id);

        if (!eliminado) {
            return res.status(404).json({ error: 'Tipo de evaluación no encontrado' });
        }

        return res.json({ mensaje: 'Tipo de evaluación eliminado correctamente' });
    } catch (error) {
        console.error('❌ Error al eliminar tipo de evaluación:', error);
        return res.status(400).json({ error: 'Error al eliminar el tipo de evaluación' });
    }
});

export default router;
