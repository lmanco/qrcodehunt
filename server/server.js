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
import LoginRoutes from './routes/LoginRoutes.js';
import LoginController from './controllers/LoginController.js';
import session from 'express-session';
import sessionFileStore from 'session-file-store';
import unless from 'express-unless';
import { fileURLToPath } from 'url';

const config = new ConfigLoader(fs, process, console).config;
const dataRoot = `${config.dataDir}/${config.huntConfig.name}`;
const dataWriter = new DataWriter(fs, dataRoot, console);
const dataReader = new DataReader(fs, dataRoot, console);
const codeRepository = new CodeRepository(dataWriter, dataReader, dataRoot, config.baseUrl, fs, qrcode, jimp);
const userRepository = new UserRepository(dataWriter, dataReader, bcrypt, config.huntConfig.numCodes);
new DALInit(config, fs, console, codeRepository, userRepository, uuid).init();

const app = express();
const FileStore = sessionFileStore(session);
app.use(bodyParser.json());
app.use(compression());
app.use(cors());
app.use(session({
    store: new FileStore({ path: `${config.dataDir}/${config.huntConfig.name}/sessions` }),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: { maxAge: 14 * 86400 * 1000 } // 2 weeks in ms
}));
const auth = (req, res, next) => {
    if (!req.session.user)
        res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    else
        next();
}
auth.unless = unless;
app.use(auth.unless({
    path: [
        { url: '/api/users', methods: ['POST'] },
        { url: '/api/login', methods: ['POST'] },
    ]
}));

const usersController = new UsersController(userRepository, codeRepository, config);
app.use('/api/users', new UsersRoutes(express, usersController).router);

const loginController = new LoginController(userRepository, bcrypt);
app.use('/api/login', new LoginRoutes(express, loginController).router);
app.post('/api/logout', loginController.logout);

app.all('/api/*', (req, res) => {
    res.status(StatusCodes.NOT_FOUND).json({ error: 'Resource not found' });
});

const __dirname = fileURLToPath(import.meta.url);
app.use(express.static(__dirname + '/public/'));
app.get(/.*/, (req, res) => {
    const uiPath = `${__dirname}/public/index.html`;
    if (!fs.existsSync(uiPath))
        res.status(StatusCodes.NOT_FOUND).send('Web UI missing');
    else
        res.sendFile(uiPath);
});

app.set('port', (process.env.PORT || 8081));
app.listen(app.get('port'), () => {
    console.log('Server running on port ' + app.get('port'));
});