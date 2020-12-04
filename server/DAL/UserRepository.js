export default class UserRepository {

    static dirName = 'users';

    constructor(dataWriter, dataReader, bcrypt, numCodes) {
        this.dataWriter = dataWriter;
        this.dataReader = dataReader;
        this.bcrypt = bcrypt;
        this.numCodes = numCodes;
    }

    async create(user) {
        const userData = {
            name: user.name,
            password: this.bcrypt.hashSync(user.password, 10),
            codesFound: Array.from({ length: this.numCodes }, () => false)
        };
        await this.dataWriter.write(UserRepository.dirName, userData.name.toLowerCase(), userData);
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
        if (!code || code.num > user.codesFound.length || code.num < 1)
            return user;
        user.codesFound[code.num - 1] = true;
        this.dataWriter.write(UserRepository.dirName, userName.toLowerCase(), user);
        return user;
    }

    updateNumCodes(numOldCodes, newNumCodes) {
        const users = this.dataReader.readDirJSONFilesSync(UserRepository.dirName);
        users.forEach(user => {
            if (user.codesFound.length !== newNumCodes) {
                user.codesFound = (numNewCodes < user.codesFound.length) ?
                    user.codesFound.slice(0, newNumCodes) :
                    user.codesFound = user.codesFound.concat(Array.from({ length: numNewCodes - numOldCodes }, () => false))
            }
        })
    }
}