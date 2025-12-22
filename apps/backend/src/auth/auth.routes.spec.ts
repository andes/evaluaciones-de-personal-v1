import * as mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server-global';
import { environment } from '../../environments/environment';
const request = require('supertest');
import { UsersCtr } from '../users/user.controller';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

let mongoServer: any;
let app;
const { application } = require('../application');

beforeAll(async () => {
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getConnectionString();
    environment.mongo_host = mongoUri;

    const { Connections } = require('../connection');
    const { application } = require('../application');

    Connections.initialize();
    const AuthRouter = require('./auth.routes').AuthRouter;
    application.add({ path: '/api/auth', router: AuthRouter });
    application.start();

    app = application.expressApp;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    await application.stop();
});

describe('AUTH - Test', () => {
    let usuario;
    it('get version', () => {
        return request(app)
            .get('/version')
            .expect(200);
    });

    it('create user', () => {
        const user = {
            nombre: 'juan',
            apellido: 'perez',
            password: '123123',
            email: 'a@g.com',
            documento: '30000000'
        };
        return request(app)
            .post('/api/auth/create')
            .send(user)
            .set('Accept', 'application/json')
            .expect(200)
            .then(async () => {
                const users = await UsersCtr.search({ nombre: user.nombre }, {}, null);
                expect(users.length).toBe(1);
                usuario = users[0];
            });
    });

    it('prevent login without active', () => {
        return request(app)
            .post('/api/auth/login')
            .send({ email: 'a@g.com', password: '123123' })
            .set('Accept', 'application/json')
            .expect(403);
    });

    it('active account', () => {
        return request(app)
            .post(`/api/auth/validate/${usuario.validationToken}`)
            .set('Accept', 'application/json')
            .expect(200)
            .then(async () => {
                const user = await UsersCtr.findById(usuario._id, {});
                expect(user.active).toBe(true);
                expect(user.validationToken).toBe(null);
            });
    });

    it('login success', () => {
        return request(app)
            .post('/api/auth/login')
            .send({ email: 'a@g.com', password: '123123' })
            .set('Accept', 'application/json')
            .expect(200);
    });

    it('wrong password', () => {
        return request(app)
            .post('/api/auth/login')
            .send({ email: 'a@g.com', password: '123123222' })
            .set('Accept', 'application/json')
            .expect(403);
    });
});
