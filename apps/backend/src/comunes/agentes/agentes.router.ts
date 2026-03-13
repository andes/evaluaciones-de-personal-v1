import { Router } from 'express';
import mongoose from 'mongoose';
import { AgenteModel } from './agentes.schema';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import multer from 'multer';
import { verifyToken } from '../../auth/auth.middleware';
import { successResponse, errorResponse } from '../../Utilidades/apiResponse';



const router = Router();
const isDev = process.env.NODE_ENV === 'development';

interface AgenteCSVRow {
    Legajo: string;
    nombre: string;
    dni: string;
}

interface MongoError extends Error {
    code?: number;
}


const uploadPath = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadPath),
    filename: (_, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '');
        cb(null, `${Date.now()}-${safeName}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (_, file, cb) => {
        if (!file.mimetype.includes('csv')) {
            cb(new Error('Solo se permiten archivos CSV'));
        } else {
            cb(null, true);
        }
    }
});

// ======================
// VALIDADOR SIMPLE
// ======================

function validarAgente(body: any) {
    const { nombre, dni, legajo } = body;

    if (!nombre || typeof nombre !== 'string')
        return 'El nombre es obligatorio';

    if (!dni || isNaN(Number(dni)))
        return 'El DNI debe ser numérico';

    if (!legajo || isNaN(Number(legajo)))
        return 'El legajo debe ser numérico';

    return null;
}



router.get('/rAgentes', verifyToken, async (req, res) => {
    try {

        const search = req.query.search?.toString().trim() || '';
        const tipo = req.query.tipo?.toString() || 'nombre';

        console.log('SEARCH:', search);
        console.log('TIPO:', tipo);

        let filtro: any = {
            activo: { $ne: false }
        };

        if (search !== '') {

            if (tipo === 'nombre') {
                filtro.nombre = { $regex: search, $options: 'i' };
            }

            if (tipo === 'legajo') {
                filtro.legajo = search;
            }
        }

        let query = AgenteModel.find(filtro)
            .sort({ nombre: 1 });

        if (search === '') {
            query = query.limit(20);
        }

        const data = await query.lean();

        return successResponse(res, data, 'Agentes obtenidos correctamente');

    } catch (error) {
        console.error(error);
        return errorResponse(res, 'Error al obtener agentes', 500);
    }
});


router.get('/rAgentes/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'ID inválido', 400);
        }

        const agente = await AgenteModel.findById(id).lean();

        if (!agente) {
            return errorResponse(res, 'Agente no encontrado', 404);
        }

        return successResponse(res, agente, 'Agente obtenido correctamente');

    } catch (error) {
        console.error(error);
        return errorResponse(res, 'Error al buscar agente', 500, isDev ? error : undefined);
    }
});



router.post('/rAgentes', verifyToken, async (req, res) => {
    try {
        const errorValidacion = validarAgente(req.body);
        if (errorValidacion) {
            return errorResponse(res, errorValidacion, 400);
        }

        const nuevoAgente = await AgenteModel.create({
            nombre: req.body.nombre.trim(),
            dni: Number(req.body.dni),
            legajo: Number(req.body.legajo)
        });

        return successResponse(res, nuevoAgente, 'Agente creado correctamente', 201);

    } catch (error: unknown) {
        const err = error as MongoError;

        if (err.code === 11000) {
            return errorResponse(res, 'El legajo o DNI ya está registrado', 400);
        }

        console.error(err);
        return errorResponse(res, 'Error al crear el agente', 500, isDev ? err : undefined);
    }
});



router.put('/rAgentes/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'ID inválido', 400);
        }

        const errorValidacion = validarAgente(req.body);
        if (errorValidacion) {
            return errorResponse(res, errorValidacion, 400);
        }

        const actualizado = await AgenteModel.findByIdAndUpdate(
            id,
            {
                nombre: req.body.nombre.trim(),
                dni: Number(req.body.dni),
                legajo: Number(req.body.legajo)
            },
            { new: true, runValidators: true }
        );

        if (!actualizado) {
            return errorResponse(res, 'Agente no encontrado', 404);
        }

        return successResponse(res, actualizado, 'Agente actualizado correctamente');

    } catch (error: unknown) {
        const err = error as MongoError;

        if (err.code === 11000) {
            return errorResponse(res, 'El legajo o DNI ya está registrado', 400);
        }

        console.error(err);
        return errorResponse(res, 'Error al actualizar el agente', 500, isDev ? err : undefined);
    }
});



router.post(
    '/rAgentes/importar-csv',
    verifyToken,
    upload.single('archivo'),
    async (req, res) => {

        if (!req.file) {
            return errorResponse(res, 'No se subió ningún archivo CSV', 400);
        }

        const filePath = req.file.path;
        const agentesNuevos: { nombre: string; dni: number; legajo: number }[] = [];

        try {
            fs.createReadStream(filePath)
                .pipe(csvParser({ separator: ';' }))
                .on('data', (row: AgenteCSVRow) => {

                    const legajo = Number(row.Legajo);
                    const nombre = row.nombre?.trim();
                    const dni = Number(row.dni);

                    if (!legajo || !nombre || !dni) return;

                    agentesNuevos.push({ nombre, dni, legajo });
                })
                .on('error', (err) => {
                    console.error(err);
                    fs.unlinkSync(filePath);
                    return errorResponse(res, 'Error leyendo el CSV', 500, isDev ? err : undefined);
                })
                .on('end', async () => {
                    try {
                        if (agentesNuevos.length > 0) {
                            await AgenteModel.insertMany(agentesNuevos, { ordered: false });
                        }

                        fs.unlinkSync(filePath);

                        return successResponse(
                            res,
                            { insertados: agentesNuevos.length },
                            'Importación completa'
                        );

                    } catch (err) {
                        console.error(err);
                        fs.unlinkSync(filePath);
                        return errorResponse(res, 'Error al insertar agentes', 500, isDev ? err : undefined);
                    }
                });

        } catch (err) {
            console.error(err);
            fs.unlinkSync(filePath);
            return errorResponse(res, 'Error al procesar el archivo CSV', 500, isDev ? err : undefined);
        }
    }
);

export default router;