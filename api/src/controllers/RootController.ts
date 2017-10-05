import {Get, JsonController} from 'routing-controllers';

@JsonController('/')
export class RootController {

    @Get('/')
    root() {
        return {
            info: 'ArduinoOTA Service provider',
            version: '0.0.1',
            servertime: new Date()
        };
    }
}
