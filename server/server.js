import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import ConfigLoader from './ConfigLoader.js';
import DALInit from './DAL/DALInit.js';

const config = new ConfigLoader(fs, process, console).config;
new DALInit(config, fs, console).init();

const app = express();
app.use(bodyParser.json());
app.use(compression());
app.use(cors());

app.use(express.static(import.meta.url + '/public/'));
app.get(/.*/, (req, res) => {
    res.sendFile(import.meta.url + '/public/index.html');
});

app.set('port', (process.env.PORT || 8081));
app.listen(app.get('port'), () => {
    console.log('Server running on port ' + app.get('port'));
});