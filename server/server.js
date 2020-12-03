import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import ConfigLoader from './ConfigLoader.js';
import DALInit from './DAL/DALInit.js';
import * as uuid from 'uuid';
import CodeRepository from './DAL/CodeRepository.js';
import DataWriter from './DAL/Util/DataWriter.js';
import DataReader from './DAL/Util/DataReader.js';
import qrcode from 'qrcode';
import jimp from 'jimp';
import UsersController from './controllers/UsersController.js';
import UserRepository from './DAL/UserRepository.js';
import bcrypt from 'bcryptjs';
import UsersRoutes from './routes/UsersRoutes.js';
import { StatusCodes } from 'http-status-codes';
import jwt from 'express-jwt';
import LoginTokensRoutes from './routes/LoginTokensRoutes.js';
import LoginTokenRepository from './DAL/LoginTokenRepository.js';
import LoginTokensController from './controllers/LoginTokensController.js';
import jsonwebtoken from 'jsonwebtoken';

const config = new ConfigLoader(fs, process, console).config;
const dataRoot = `${config.dataDir}/${config.huntConfig.name}`;
const dataWriter = new DataWriter(fs, dataRoot, console);
const dataReader = new DataReader(fs, dataRoot, console);
const codeRepository = new CodeRepository(dataWriter, dataReader, dataRoot, config.baseUrl, fs, qrcode, jimp);
const userRepository = new UserRepository(dataWriter, dataReader, bcrypt);
const loginTokenRepository = new LoginTokenRepository(dataWriter, dataReader, config, jsonwebtoken, uuid);
new DALInit(config, fs, console, codeRepository, uuid).init();

const app = express();
app.use(bodyParser.json());
app.use(compression());
app.use(cors());
app.use(jwt({ secret: config.jwtSecret, algorithms: ['HS256']}).unless({path: [
    { url: '/api/login-tokens', methods: ['POST'] },
    { url: '/api/users', methods: ['POST'] }
]}));
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError')
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
});

const usersController = new UsersController(userRepository, codeRepository);
app.use('/api/users', new UsersRoutes(express, usersController).router);

const loginTokensController = new LoginTokensController(loginTokenRepository, userRepository, bcrypt);
app.use('/api/login-tokens', new LoginTokensRoutes(express, loginTokensController).router);

app.use(express.static(import.meta.url + '/public/'));
app.get(/.*/, (req, res) => {
    res.sendFile(import.meta.url + '/public/index.html');
});

app.all('*', (req, res) => {
    res.status(StatusCodes.NOT_FOUND).json({ error: 'Resource not found' });
});

app.set('port', (process.env.PORT || 8081));
app.listen(app.get('port'), () => {
    console.log('Server running on port ' + app.get('port'));
});