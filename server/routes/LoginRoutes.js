export default class LoginRoutes {

    constructor(express, loginController) {
        this.router = express.Router();
        this.router.post('/', loginController.login.bind(loginController));
    }
}