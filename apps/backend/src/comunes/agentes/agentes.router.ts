import { Router } from 'express';
import { AgenteModel } from './agentes.schema';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import multer from 'multer';

const router = Router();


// Tipado fila del CSV

interface AgenteCSVRow {
    Legajo: string;
    nombre: string;
    dni: string;
}


// Tipado error Mongo

interface MongoError extends Error {
    code?: number;
}


// Configuración de MULTER (subida de archivos)

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// ============================
// LISTAR
// ============================
router.get('/rAgentes', async (req, res) => {
    try {
        const data = await AgenteModel.find().sort({ nombre: 1 });
        res.json(data);
    } catch (error) {
        console.error('Error al obtener los agentes:', error);
        res.status(500).json({ error: 'Error al obtener los agentes' });
    }
});

// ============================
// BUSCAR POR ID
// ============================
router.get('/rAgentes/:id', async (req, res) => {
    try {
        const agente = await AgenteModel.findById(req.params.id);
        if (!agente) return res.status(404).json({ error: 'Agente no encontrado' });
        res.json(agente);
    } catch (error) {
        console.error('Error al buscar agente por ID:', error);
        res.status(500).json({ error: 'Error al buscar agente' });
    }
});

// ============================
// CREAR
// ============================
router.post('/rAgentes', async (req, res) => {
    try {
        const nuevoAgente = await AgenteModel.create(req.body);
        res.status(201).json(nuevoAgente);
    } catch (error: unknown) {

        const err = error as MongoError;

        if (err.code === 11000) {
            return res.status(400).json({
                error: 'El legajo o DNI ya está registrado'
            });
        }

        console.error('Error al crear el agente:', err);
        res.status(500).json({ error: 'Error al crear el agente' });
    }
});

// ============================
// ACTUALIZAR
// ============================
router.put('/rAgentes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { legajo, dni, nombre } = req.body;

        const agenteActual = await AgenteModel.findById(id);
        if (!agenteActual) {
            return res.status(404).json({ error: 'Agente no encontrado' });
        }

        // duplicado legajo
        if (legajo && legajo !== agenteActual.legajo) {
            const existeLegajo = await AgenteModel.findOne({ legajo, _id: { $ne: id } });
            if (existeLegajo) {
                return res.status(400).json({ error: 'Ya existe un agente con el mismo legajo.' });
            }
        }

        // duplicado dni
        if (dni && dni !== agenteActual.dni) {
            const existeDni = await AgenteModel.findOne({ dni, _id: { $ne: id } });
            if (existeDni) {
                return res.status(400).json({ error: 'Ya existe un agente con el mismo DNI.' });
            }
        }

        const actualizado = await AgenteModel.findByIdAndUpdate(
            id,
            { nombre, dni, legajo },
            { new: true }
        );

        res.json(actualizado);

    } catch (error) {
        console.error('Error al actualizar el agente:', error);
        res.status(500).json({ error: 'Error al actualizar el agente' });
    }
});

// ============================
// ELIMINAR
// ============================
router.delete('/rAgentes/:id', async (req, res) => {
    try {
        const eliminado = await AgenteModel.findByIdAndDelete(req.params.id);

        if (!eliminado) {
            return res.status(404).json({ error: 'Agente no encontrado' });
        }

        res.json({ message: 'Agente eliminado correctamente' });

    } catch (error) {
        console.error('Error al eliminar el agente:', error);
        res.status(500).json({ error: 'Error al eliminar el agente' });
    }
});

// ============================
// IMPORTAR CSV
// ============================
router.post('/rAgentes/importar-csv', upload.single('archivo'), async (req, res) => {

    const file = req.file; // ahora si existe tipado
    if (!file) {
        return res.status(400).json({ error: 'No se subió ningún archivo CSV.' });
    }

    const filePath = file.path;

    const agentesNuevos: { nombre: string; dni: number; legajo: number }[] = [];

    try {
        fs.createReadStream(filePath)
            .pipe(csvParser({ separator: ';' })) // tu CSV usa ;
            .on('data', (row: AgenteCSVRow) => {
                const legajo = parseInt(row.Legajo);
                const nombre = row.nombre?.trim();
                const dni = parseInt(row.dni);

                if (!legajo || !nombre || !dni) return;

                agentesNuevos.push({ nombre, dni, legajo });
            })
            .on('end', async () => {
                try {
                    if (agentesNuevos.length > 0) {
                        await AgenteModel.insertMany(agentesNuevos);
                    }

                    fs.unlinkSync(filePath); // borrar archivo subido

                    res.json({
                        message: 'Importación completa',
                        insertados: agentesNuevos.length
                    });

                } catch (err) {
                    console.error('Error al insertar nuevos agentes:', err);
                    res.status(500).json({ error: 'Error al insertar nuevos agentes.' });
                }
            });

    } catch (err) {
        console.error('Error al procesar el archivo CSV:', err);
        res.status(500).json({ error: 'Error al procesar el archivo CSV.' });
    }
});

export default router;
