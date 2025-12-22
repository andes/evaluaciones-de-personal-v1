import { Router } from 'express';
import { EfectorModel } from '../schemas/efectores';

const router = Router();

// GET LISTADO
router.get('/rmEfectores', async (req, res, next) => {
    try {
        const data = await EfectorModel.find().sort({ descripcion: 1 });
        res.json(data);
    } catch (error) {
        console.error('Error al obtener los Efectores:', error);
        res.status(500).json({ error: 'Error al obtener los efectores' });
    }
});

// GET POR ID
router.get('/rmEfectores/:id', async (req, res) => {
    const id = req.params.id;
    const respuesta = await EfectorModel.findById(id);
    res.json(respuesta);
});

// 🔹 POST CREAR
router.post('/rmEfectores', async (req, res) => {
    try {
        const { nombre } = req.body;

        const nuevoEfector = new EfectorModel({ nombre });

        const resultado = await nuevoEfector.save();
        res.status(201).json(resultado);

    } catch (error) {
        console.error('Error al crear efector:', error);
        res.status(400).json({ error: 'Error al crear el efector' });
    }
});


export default router;
