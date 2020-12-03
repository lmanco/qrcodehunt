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
        this.dataWriter.write(UserRepository.dirName, userData.name.toLowerCase(), userData);
        return userData;
    }

    async getUserByName(userName) {
        const user = await this.dataReader.read(UserRepository.dirName, userName.toLowerCase());
        if (user) {
            const allUsers = await this.dataReader.readDirJSONFiles(UserRepository.dirName);
            user.rank = this.getUserRank(user, allUsers);
            user.numTied = this.getNumUsersTied(user, allUsers);
        }
        return user;
    }

    getUserRank(user, allUsers) {
        const numUsersAhead = allUsers.filter(otherUser => otherUser.name !== user.name &&
                otherUser.codesFound.length > user.codesFound.length).length;
        return 1 + numUsersAhead;
    }

    getNumUsersTied(user, allUsers) {
        return allUsers.filter(otherUser => otherUser.name !== user.name &&
            otherUser.codesFound.length === user.codesFound.length).length;
    }

    async addCodeFound(userName, code) {
        const user = await this.getUserByName(userName);
        if (!user)
            return null;
        if (!code || user.codesFound.includes(code.num))
            return user;
        user.codesFound.push(code.num);
        this.dataWriter.write(UserRepository.dirName, userName.toLowerCase(), user);
        return user;
    }
}