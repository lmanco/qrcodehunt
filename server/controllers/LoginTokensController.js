import { StatusCodes } from "http-status-codes";

export default class LoginTokensController {

    static badLoginError = 'You have entered an invalid username or password. Please try again.';

    constructor(loginTokensRepository, userRepository, bcrypt) {
        this.loginTokensRepository = loginTokensRepository;
        this.userRepository = userRepository;
        this.bcrypt = bcrypt;
    }

    async create(req, res) {
        try {
            const error = this.getLoginError(req.body);
            if (error) {
                res.status(StatusCodes.BAD_REQUEST).json({ error: error });
                return;
            }
            const user = await this.userRepository.getUserByName(req.body.username);
            if (!user || !(await this.bcrypt.compare(req.body.password, user.password))) {
                res.status(StatusCodes.BAD_REQUEST).json({ error: LoginController.badLoginError });
                return;
            }
            const createdLoginToken = await this.loginTokensRepository.create(req.body.username);
            res.status(StatusCodes.CREATED).json(createdLoginToken);
        }
        catch (err) {
            console.error(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: `${err}` });
        }
    }

    getLoginError(reqBody) {
        if (!reqBody.username)
            return 'username is required';
        if (!reqBody.password)
            return 'password is required';
    }
}