export default class LoginTokensRoutes {

    constructor(express, loginTokensController) {
        this.router = express.Router();
        this.router.post('/', loginTokensController.create.bind(loginTokensController));
    }
}