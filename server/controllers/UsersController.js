import { StatusCodes } from 'http-status-codes';

export default class UsersController {

    constructor(userRepository, codeRepository) {
        this.userRepository = userRepository;
        this.codeRepository = codeRepository;
    }

    async findByName(req, res) {
        try {
            const user = await this.userRepository.getUserByName(req.params.name);
            if (!user) {
                res.status(StatusCodes.NOT_FOUND).json({ error: `user ${req.params.name} not found` });
                return;
            }
            if (req.session.user !== user.name) {
                res.status(StatusCodes.FORBIDDEN).json({ error: 'Forbidden' });
                return;
            }
            if (!user) {
                res.status(StatusCodes.NOT_FOUND).json({ error: `user ${req.params.name} not found` });
                return;
            }
            delete user.password;
            res.status(StatusCodes.OK).json(user);
        }
        catch (err) {
            console.error(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: `${err}` });
        }
    }

    async create(req, res) {
        try {
            const error = this.getNewUserError(req.body);
            if (error) {
                res.status(StatusCodes.BAD_REQUEST).json({ error: error });
                return;
            }
            const user = await this.userRepository.getUserByName(req.body.name);
            if (user) {
                res.status(StatusCodes.CONFLICT)
                    .json({ error: `user ${req.body.name} already exists` });
                return;
            }
            const createdUser = await this.userRepository.create(req.body);
            delete createdUser.password;
            req.session.user = createdUser.name;
            res.status(StatusCodes.CREATED).json(createdUser);
        }
        catch (err) {
            console.error(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: `${err}` });
        }
    }

    getNewUserError(reqBody) {
        if (!reqBody.name)
            return 'name is required';
        if (!/^[a-z0-9_.@()-]+$/i.test(reqBody.name))
            return 'name may only contain alphanumeric characters, _, ., @, (, ), and -';
        if (!reqBody.password)
            return 'password is required';
        if (/\s/.test(reqBody.password))
            return 'password may not contain spaces';
    }

    async updateCodesFound(req, res) {
        try {
            const user = await this.userRepository.getUserByName(req.params.name);
            if (!user) {
                res.status(StatusCodes.NOT_FOUND).json({ error: `user ${req.params.name} not found` });
                return;
            }
            if (req.session.user !== user.name) {
                res.status(StatusCodes.FORBIDDEN).json({ error: 'Forbidden' });
                return;
            }
            const code = await this.codeRepository.getCodeByKey(req.params.key);
            const result = await this.userRepository.addCodeFound(user.name, code);
            delete result.password;
            res.status(StatusCodes.OK).json(result);
        }
        catch (err) {
            console.error(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: `${err}` });
        }
    }
}