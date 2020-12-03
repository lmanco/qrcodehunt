import { StatusCodes } from 'http-status-codes';

export default class UsersController {

    constructor(userRepository, codeRepository) {
        this.userRepository = userRepository;
        this.codeRepository = codeRepository;
    }

    async create(req, res) {
        try {
            const user = await this.userRepository.getUserByName(req.body.name);
            if (user)
                res.status(StatusCodes.CONFLICT).json({ error: `user ${req.body.name} already exists` });
            const createdUser = await this.userRepository.create(req.body);
            res.status(StatusCodes.CREATED).json(createdUser)
        }
        catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: `${err}` });
        }
    }

    async updateCodesFound(req, res) {
        const user = await this.userRepository.getUserByName(req.params.name);
        if (!user)
            res.status(StatusCodes.NOT_FOUND).json({ error: `user ${req.params.name} not found` });
        await this.codeRepository.getCodeByKey(req.params.key);
    }
}