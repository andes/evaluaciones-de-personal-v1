import { Router } from 'express';
import { AgenteModel } from './agentes.schema';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import multer from 'multer';
import { verifyToken } from '../../auth/auth.middleware';
import { successResponse, errorResponse } from '../../Utilidades/apiResponse';

const router = Router();

interface AgenteCSVRow {
    Legajo: string;
    nombre: string;
    dni: string;
}

interface MongoError extends Error {
    code?: number;
}


// MULTER

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



// LISTAR

router.get('/rAgentes', verifyToken, async (req, res) => {
    try {
        const data = await AgenteModel.find().sort({ nombre: 1 });

        return successResponse(res, data, 'Agentes obtenidos correctamente');

    } catch (error) {
        console.error(error);
        return errorResponse(res, 'Error al obtener los agentes', 500, error);
    }
});



// BUSCAR POR ID

router.get('/rAgentes/:id', verifyToken, async (req, res) => {
    try {
        const agente = await AgenteModel.findById(req.params.id);

        if (!agente) {
            return errorResponse(res, 'Agente no encontrado', 404);
        }

        return successResponse(res, agente, 'Agente obtenido correctamente');

    } catch (error) {
        console.error(error);
        return errorResponse(res, 'Error al buscar agente', 500, error);
    }
});



// CREAR

router.post('/rAgentes', verifyToken, async (req, res) => {
    try {
        const nuevoAgente = await AgenteModel.create(req.body);

        return successResponse(
            res,
            nuevoAgente,
            'Agente creado correctamente',
            201
        );

    } catch (error: unknown) {

        const err = error as MongoError;

        if (err.code === 11000) {
            return errorResponse(
                res,
                'El legajo o DNI ya está registrado',
                400
            );
        }

        console.error(err);
        return errorResponse(res, 'Error al crear el agente', 500, err);
    }
});



// ACTUALIZAR

router.put('/rAgentes/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { legajo, dni, nombre } = req.body;

        const agenteActual = await AgenteModel.findById(id);

        if (!agenteActual) {
            return errorResponse(res, 'Agente no encontrado', 404);
        }

        // duplicado legajo
        if (legajo && legajo !== agenteActual.legajo) {
            const existeLegajo = await AgenteModel.findOne({
                legajo,
                _id: { $ne: id }
            });

            if (existeLegajo) {
                return errorResponse(
                    res,
                    'Ya existe un agente con el mismo legajo',
                    400
                );
            }
        }

        // duplicado dni
        if (dni && dni !== agenteActual.dni) {
            const existeDni = await AgenteModel.findOne({
                dni,
                _id: { $ne: id }
            });

            if (existeDni) {
                return errorResponse(
                    res,
                    'Ya existe un agente con el mismo DNI',
                    400
                );
            }
        }

        const actualizado = await AgenteModel.findByIdAndUpdate(
            id,
            { nombre, dni, legajo },
            { new: true }
        );

        return successResponse(
            res,
            actualizado,
            'Agente actualizado correctamente'
        );

    } catch (error) {
        console.error(error);
        return errorResponse(res, 'Error al actualizar el agente', 500, error);
    }
});


/*
// ELIMINAR

router.delete('/rAgentes/:id', verifyToken, async (req, res) => {
    try {
        const eliminado = await AgenteModel.findByIdAndDelete(req.params.id);

        if (!eliminado) {
            return errorResponse(res, 'Agente no encontrado', 404);
        }

        return successResponse(
            res,
            null,
            'Agente eliminado correctamente'
        );

    } catch (error) {
        console.error(error);
        return errorResponse(res, 'Error al eliminar el agente', 500, error);
    }
});

*/

// IMPORTAR CSV

router.post(
    '/rAgentes/importar-csv',
    verifyToken,
    upload.single('archivo'),
    async (req, res) => {

        const file = req.file;

        if (!file) {
            return errorResponse(res, 'No se subió ningún archivo CSV', 400);
        }

        const filePath = file.path;
        const agentesNuevos: { nombre: string; dni: number; legajo: number }[] = [];

        try {

            fs.createReadStream(filePath)
                .pipe(csvParser({ separator: ';' }))
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

                        fs.unlinkSync(filePath);

                        return successResponse(
                            res,
                            { insertados: agentesNuevos.length },
                            'Importación completa'
                        );

                    } catch (err) {
                        console.error(err);
                        return errorResponse(
                            res,
                            'Error al insertar nuevos agentes',
                            500,
                            err
                        );
                    }
                });

        } catch (err) {
            console.error(err);
            return errorResponse(
                res,
                'Error al procesar el archivo CSV',
                500,
                err
            );
        }
    }
);

export default router;
