export default class LoginTokenRepository {

    static dirName = 'login_tokens';

    constructor(dataWriter, dataReader, config, jwt, uuid) {
        this.dataWriter = dataWriter;
        this.dataReader = dataReader;
        this.config = config;
        this.jwt = jwt;
        this.uuid = uuid;
    }

    async create(userName) {
        const jwtSecret = this.config.jwtSecret;
        const tokenData = {
            token: this.jwt.sign(
                { username: userName },
                jwtSecret,
                {
                    expiresIn: '14d',
                    jwtid: this.uuid.v4()
                }
            )
        }
        await this.dataWriter.write(LoginTokenRepository.dirName, userName.toLowerCase(), tokenData);
        return tokenData;
    }
}