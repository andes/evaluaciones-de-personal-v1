import { Router } from 'express';
import { ServicioModel } from '../Schemas/servicios';

const router = Router();


router.get('/rmServicios', async (req, res, next) => {
    try {
        const data = await ServicioModel.find().sort({ descripcion: 1 });
        res.json(data);
    } catch (error) {
        console.error('Error al obtener los servicios:', error);
        res.status(500).json({ error: 'Error al obtener los servicios' });
    }
});



router.get('/rmServicios/:id', async (req, res) => {
    const id = req.params.id;
    const respuesta = await ServicioModel.findById(id);
    res.json(respuesta);
});



router.post('/rmServicios', async (req, res) => {
    try {

        const nuevoServicio = await ServicioModel.create(req.body);
        res.status(201).json(nuevoServicio);
    } catch (error) {
        console.error('Error al crear el servicio:', error);
        res.status(500).json({ error: 'Ha ocurrido un error' });
    }
});



router.put('/rmServicios/:id', async (req, res) => {
    try {
        const nuevaDescripcion = req.body.descripcion;

        // Verificar duplicado en otro documento
        const servicioExistente = await ServicioModel.findOne({
            descripcion: nuevaDescripcion,
            _id: { $ne: req.params.id }
        });

        if (servicioExistente) {
            return res.status(400).json({
                error: 'La descripción ya se encuentra registrada.'
            });
        }

        const respuesta = await ServicioModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!respuesta) {
            return res.status(404).json({ error: 'Servicio no encontrado.' });
        }

        res.json(respuesta);

    } catch (error) {
        console.error('Error en la actualización:', error);
        res.status(500).json({ error: 'Ha ocurrido un error' });
    }
});



// DELETE - Eliminar servicio

router.delete('/rmServicios/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const respuesta = await ServicioModel.findByIdAndDelete(id);

        if (respuesta) {
            res.json({ message: 'Servicio eliminado correctamente' });
        } else {
            res.status(404).json({ error: 'Servicio no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Ha ocurrido un error' });
    }
});

export default router;
