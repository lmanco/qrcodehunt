export default class UsersRoutes {

    constructor(express, usersController) {
        this.router = express.Router();
        this.router.get('/:name', usersController.findByName.bind(usersController));
        this.router.post('/', usersController.create.bind(usersController));
        this.router.patch('/:name/codesFound/:key', usersController.updateCodesFound.bind(usersController));
        this.router.get('/m/e', usersController.getCurrentUser.bind(usersController));
    }
}