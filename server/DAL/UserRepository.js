export default class UserRepository {

    static dirName = 'users';

    constructor(dataWriter, dataReader, bcrypt) {
        this.dataWriter = dataWriter;
        this.dataReader = dataReader;
        this.bcrypt = bcrypt;
    }

    async create(user) {
        const userData = {
            name: user.name,
            password: this.bcrypt.hashSync(user.password, 10),
            codesFound: []
        };
        this.dataWriter.write(UserRepository.dirName, userData.name.toLower(), userData);
        return userData;
    }

    async getUserByName(userName) {
        return await this.dataReader.read(UserRepository.dirName, userName.toLower());
    }
}