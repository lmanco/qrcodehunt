export default class DALInit {

    constructor(config, fs, logger) {
        this.config = config;
        this.fs = fs;
        this.logger = logger;
    }

    init () {
        if (!this.fs.existsSync(this.config.dataDir)) {
            const dir = this.fs.mkdirSync(this.config.dataDir, { recursive: true });
            this.logger.log(`Created data directory ${dir}`);
        }
        const huntDataPath = `${this.config.dataDir}/${this.config.huntConfig.name}`;
        if (!this.fs.existsSync(huntDataPath)) {
            const dir = this.fs.mkdirSync(huntDataPath, { recursive: true });
            this.logger.log(`Created hunt data directory ${dir}`);
        }
    }
    
}