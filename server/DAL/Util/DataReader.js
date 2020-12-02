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
        if (!(await this.fs.exists(filePath)))
            return null;
        try {
            return JSON.parse(await this.fs.readFile(filePath));
        }
        catch (err) {
            this.logger.error(`Failed to read ${filePath}:`);
            this.logger.error(err);
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
}