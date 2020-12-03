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

const config = new ConfigLoader(fs, process, console).config;
const dataRoot = `${config.dataDir}/${config.huntConfig.name}`;
const dataWriter = new DataWriter(fs, dataRoot, console);
const dataReader = new DataReader(fs, dataRoot, console);
const codeRepository = new CodeRepository(dataWriter, dataReader, dataRoot, config.baseUrl, fs, qrcode, jimp);
const userRepository = new UserRepository(dataWriter, dataReader, bcrypt)
new DALInit(config, fs, console, codeRepository, uuid).init();

const app = express();
app.use(bodyParser.json());
app.use(compression());
app.use(cors());

const usersController = new UsersController(userRepository, codeRepository);
app.use('/users', new UsersRoutes(express, usersController).router);

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