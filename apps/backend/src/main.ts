import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectDB } from './config/database';
import 'dotenv/config';

// 🔹 Importar rutas base
//import testRoute from './router/router.test';
//import testMongoRoute from './router/testMongo.route';
import AuthRouter from './auth/auth.routes';
import { UsersRouter } from './users/user.controller';

// 🔹 Comunes
import CategoriaItemsRouter from './comunes/categoriaitems/categoriaItems.router';
import ItemsRouter from './comunes/items/items.router';
import tipoCierreEvaluacionRouter from './comunes/tipoCierreEvaluacion/TipoCierreEvaluacion.router';
import agenterouter from './comunes/agentes/agentes.router';
import ServiciosRouter from './comunes/Servicios/Routes/Servicios';
import tipoevaluacionRouter from './TipoEvaluacion/TipoEvaluacion.router';
import EfectorRouter from './comunes/Efectores/Routes/efectores';

// 🔹 Planillas
import PlanillaEDRouter from './PlanillaED/PlanillaED.router';

// 🔹 Evaluaciones
import EvaluacionCabeceraRouter from './PlanillaEDEvaluacion/EvaluacionCabecera.router';
import EvaluacionDetalleRouter from './PlanillaEDEvaluacion/EvaluacionDetalle.router';
import EvaluacionItemsRouter from './PlanillaEDEvaluacion/EvaluacionItems.router';
import evaluacionlistadorouter from './PlanillaEDEvaluacion/EvaluacionListados.router';
import { evaluacionResultadosRouter } from './PlanillaEDEvaluacion/EvaluacionResultados.router';


// --------------------------------------------------
// 🔹 Configuración del servidor
const host = process.env.HOST || 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

// --------------------------------------------------
// 🔹 Conectar a MongoDB
connectDB()
  .then(() => console.log(' Base de datos conectada correctamente'))
  .catch((err) => console.error('Error conectando a la base de datos:', err));

// --------------------------------------------------
// 🔹 Middlewares
app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --------------------------------------------------
// 🔹 Rutas base
//app.use('/api/test', testRoute);
//app.use('/api/test-mongo', testMongoRoute);
app.use('/api/users', UsersRouter);
app.use('/api/auth', AuthRouter);

// --------------------------------------------------
// 🔹 Comunes
app.use('/api/comunes/categoriaitems', CategoriaItemsRouter);
app.use('/api/comunes/items', ItemsRouter);
app.use('/api/comunes/tipocierreevaluacion', tipoCierreEvaluacionRouter);
app.use('/api/comunes/agentes', agenterouter);
app.use('/api/comunes/servicios', ServiciosRouter);
app.use('/api/comunes/efectores', EfectorRouter);
app.use('/api/tipoevaluacion', tipoevaluacionRouter);

// --------------------------------------------------
// 🔹 Planillas
app.use('/api/planillasED', PlanillaEDRouter);

// --------------------------------------------------
// 🔹 Evaluaciones (CADA UNA CON SU PREFIJO)
app.use('/api/evaluacioncabecera', EvaluacionCabeceraRouter);
app.use('/api/evaluaciondetalle', EvaluacionDetalleRouter);
app.use('/api/evaluacionitems', EvaluacionItemsRouter);
app.use('/api/evaluaciones', evaluacionlistadorouter);
app.use('/api/evaluacionresultados', evaluacionResultadosRouter);

// --------------------------------------------------
// 🔹 Ruta raíz
app.get('/', (_req, res) => {
  res.json({ message: '' });
});

// --------------------------------------------------
// 🔹 Iniciar servidor
app.listen(port, host, () => {
  console.log(` Servidor listo en: http://${host}:${port}`);
});
