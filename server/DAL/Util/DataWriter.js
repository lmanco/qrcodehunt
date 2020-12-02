export default class DataWriter {

    constructor(fs, dataRoot, logger) {
        this.fs = fs;
        this.dataRoot = dataRoot;
        this.logger = logger;
    }

    async write(dirName, fileName, data) {
        if (!fileName.endsWith('.json'))
            fileName += '.json';
        const dataPath = `${this.dataRoot}/${dirName}`;
        if (!this.fs.existsSync(dataPath))
            this.fs.mkdirSync(dataPath, { recursive: true });
        const filePath = `${dataPath}/${fileName}`;
        const dataString = JSON.stringify(data);
        try {
            await this.fs.writeFile(filePath, dataString, () => {});
        }
        catch (err) {
            this.logger.error(`Failed to write ${filePath} with data ${dataString}:`);
            this.logger.error(err);
        }
    }
}