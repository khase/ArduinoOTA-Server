import {Get, JsonController} from 'routing-controllers';

@JsonController('/')
export class AuthController {

    @Get('/')
    root() {
        return {success: true};
    }
}
