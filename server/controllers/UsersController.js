import { StatusCodes } from 'http-status-codes';
import nodemailer from 'nodemailer';
import numeral from 'numeral';

export default class UsersController {

    constructor(userRepository, codeRepository, config) {
        this.userRepository = userRepository;
        this.codeRepository = codeRepository;
        this.config = config;
    }

    async findByName(req, res) {
        try {
            const user = await this.userRepository.getUserByName(req.params.name);
            if (!user) {
                res.status(StatusCodes.NOT_FOUND).json({ error: `user ${req.params.name} not found` });
                return;
            }
            if (req.session.user.toLowerCase() !== user.name.toLowerCase()) {
                res.status(StatusCodes.FORBIDDEN).json({ error: 'Forbidden' });
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

    async getCurrentUser(req, res) {
        try {
            const user = await this.userRepository.getUserByName(req.session.user);
            if (!user) {
                res.status(StatusCodes.NOT_FOUND).json({ error: `user ${req.session.user} not found` });
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
            if (req.session.user.toLowerCase() !== user.name.toLowerCase()) {
                res.status(StatusCodes.FORBIDDEN).json({ error: 'Forbidden' });
                return;
            }
            if (user.codesFound.every(code => code)) {
                delete user.password;
                res.status(StatusCodes.OK).json(user);
                return;
            }
            const code = await this.codeRepository.getCodeByKey(req.params.key);
            const result = await this.userRepository.addCodeFound(user.name, code);
            delete result.password;
            if (result.codesFound.every(code => code))
                this.sendCompletionEmail(result);
            res.status(StatusCodes.OK).json(result);
        }
        catch (err) {
            console.error(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: `${err}` });
        }
    }

    async sendCompletionEmail(user) {
        const transporter = nodemailer.createTransport({
            service: this.config.mailer.service,
            auth: {
                user: this.config.mailer.user,
                pass: this.config.mailer.pass
            }
        });
        const huntName = this.config.huntConfig.name;
        const position = numeral(user.numTied + 1).format('0o');
        const mailOptions = {
            from: this.config.mailer.user,
            to: this.config.emailResultsTo,
            subject: `${user.name} has completed QR Code Hunt ${huntName}!`,
            text: `${user.name} has completed the ${huntName} QR Code Hunt in ${position} place.`
        };
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.error(error);
            }
            else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
}