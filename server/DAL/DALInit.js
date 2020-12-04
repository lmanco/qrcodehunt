export default class DALInit {

    constructor(config, fs, logger, codeRepository, uuid) {
        this.config = config;
        this.fs = fs;
        this.logger = logger;
        this.codeRepository = codeRepository;
        this.uuid = uuid;
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
        this.generateCodes();
    }
    
    generateCodes() {
        const numCodes = this.config.huntConfig.numCodes;
        let existingCodes = [];
        try {
            existingCodes = this.codeRepository.getCodesSync();
        }
        catch (err) {
            if (err.name !== 'SyntaxError' || err.message !== 'Unexpected end of JSON input')
                throw err;
        }
        if (!Array.isArray(existingCodes))
            existingCodes = [];
        let newCodes = [];
        if (existingCodes.length === numCodes)
            return;
        else if (existingCodes.length > numCodes)
            newCodes = existingCodes.slice(0, numCodes);
        else if (existingCodes.length < numCodes) {
            const startIndex = (existingCodes.length > 0) ?
                existingCodes[existingCodes.length-1].num : 1;
            const numNewCodes = startIndex ? numCodes - existingCodes.length :
                existingCodes.length;
            if (!startIndex)
                startIndex = 1;
            newCodes = Array.from({ length: numNewCodes }, (_, index) => ({
                key: this.uuid.v4(),
                num: index + startIndex
            }));
            if (startIndex > 1)
                newCodes = existingCodes.concat(newCodes);
        }
        this.codeRepository.createOrUpdate(newCodes)
            .catch(err => this.logger.error(`Failed to create new codes:\n${err}`))
    }
}