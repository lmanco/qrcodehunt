import { promisify } from 'util';

export default class DataReader {
    
    constructor(fs, dataRoot, logger) {
        this.fs = fs;
        this.dataRoot = dataRoot;
        this.logger = logger;
    }

    async read(dirName, fileName) {
        if (!fileName.endsWith('.json'))
            fileName += '.json';
        const filePath = `${this.dataRoot}/${dirName}/${fileName}`;
        if (!(await promisify(this.fs.exists)(filePath)))
            return null;
        try {
            return JSON.parse(await promisify(this.fs.readFile)(filePath));
        }
        catch (err) {
            this.logger.error(`Failed to read ${filePath}:`);
            this.logger.error(err);
            return null;
        }
    }

    readSync(dirName, fileName) {
        if (!fileName.endsWith('.json'))
            fileName += '.json';
        const filePath = `${this.dataRoot}/${dirName}/${fileName}`;
        if (!this.fs.existsSync(filePath))
            return null;
        return JSON.parse(this.fs.readFileSync(filePath));
    }

    async readDirJSONFiles(dirName) {
        const path = `${this.dataRoot}/${dirName}`;
        try {
            const files = await promisify(this.fs.readdir)(path);
            return await Promise.all(files.map(file => this.read(dirName, file)));
        }
        catch (err) {
            this.logger.error(`Failed to read files in directory ${path}:`);
            this.logger.error(err);
            return [];
        }
    }
}