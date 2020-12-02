export default class UserRepository {

    static dirName = 'users';

    constructor(dataWriter, dataReader) {
        this.dataWriter = dataWriter;
        this.dataReader = dataReader;
    }

    async createOrUpdate(user) {
        this.dataWriter.write(UserRepository.dirName, user.name, user);
    }

    async getUserByName(userName) {
        return await this.dataReader.read(UserRepository.dirName, userName);
    }
}