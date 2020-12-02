export default class ConfigLoader {

    static configFile = './server/config.json';

    constructor(fs, process, logger) {
        this.fs = fs;
        this.process = process;
        this.logger = logger;
        this.config = this.loadConfig();
        this.validateConfig();
    }

    loadConfig() {
        if (!this.fs.existsSync(ConfigLoader.configFile)) {
            this.logger.error(`${ConfigLoader.configFile} not found! Exiting!`);
            this.process.exit(1);
        }
        return JSON.parse(this.fs.readFileSync(ConfigLoader.configFile));
    }

    validateConfig() {

    }
}