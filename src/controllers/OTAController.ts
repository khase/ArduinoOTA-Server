import {BadRequestError, Get, HeaderParams, HttpCode, HttpError, JsonController} from 'routing-controllers';
import {OTAInfo} from '../dto/OTAInfo/OTAInfo';

@JsonController('/ota')
export class RootController {

    @Get('/')
    root(@HeaderParams() header: any) {
        if (header['user-agent'] === 'ESP8266-http-Update') {
            const espData: OTAInfo = new OTAInfo();
            espData.mode = header['x-esp8266-mode'];
            espData.staMac = header['x-esp8266-sta-mac'];
            espData.apMac = header['x-esp8266-ap-mac'];
            espData.chip.size = parseFloat(header['x-esp8266-chip-size']);
            espData.chip.free = parseFloat(header['x-esp8266-free-space']);
            espData.currentSketch.size = parseFloat(header['x-esp8266-sketch-size']);
            espData.currentSketch.versionInfo = header['x-esp8266-version'];
            espData.sdkVersion = header['x-esp8266-sdk-version'];

            this.handleArduinoOTARequest(espData);
        } else {
            throw new BadRequestError('this route is for esp only');
        }
    }

    handleArduinoOTARequest(esp: OTAInfo) {
        console.log(esp);

        // no firmwareupdate needed. Throw NOT_MODIFIED error code
        throw new HttpError(304);
    }
}
