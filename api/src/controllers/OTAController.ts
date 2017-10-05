import {
    BadRequestError,
    Get, HeaderParams, InternalServerError,
    JsonController, NotFoundError, Res, UseInterceptor
} from 'routing-controllers';
import {Response} from 'express';
import {OTAInfo} from '../dto/OTAInfo/OTAInfo';
import {MyDB} from '../services/MyDB';
import {NotModified} from '../etc/NotModified';
import {DeviceInfo} from '../dto/DeviceInfo/DeviceInfo'
import {DeploymentInfo} from '../dto/DeviceInfo/DeploymentInfo';
import config from '../config/main';
import * as fs from 'fs';

@JsonController('/ota')
export class RootController {

    @Get('/')
    root(@HeaderParams() header: any, @Res() response: Response) {
        if (header['user-agent'] === 'ESP8266-http-Update' || header['debug']) {
            const espData: OTAInfo = new OTAInfo();
            espData.mode = header['x-esp8266-mode'];
            espData.staMac = header['x-esp8266-sta-mac'];
            espData.apMac = header['x-esp8266-ap-mac'];
            espData.chip.size = parseFloat(header['x-esp8266-chip-size']);
            espData.chip.free = parseFloat(header['x-esp8266-free-space']);
            espData.currentSketch.size = parseFloat(header['x-esp8266-sketch-size']);
            espData.currentSketch.versionInfo = header['x-esp8266-version'];
            espData.sdkVersion = header['x-esp8266-sdk-version'];

            return this.handleArduinoOTARequest(espData, response);
        } else {
            throw new BadRequestError('this route is for esp only');
        }
    }

    handleArduinoOTARequest(esp: OTAInfo, response: Response) {
        return MyDB.loadDeviceInfo(esp)
            .catch((err) => {
                throw new InternalServerError(err);
            })
            .then((device: DeviceInfo) => {
                const pending: DeploymentInfo[] = device.getPendingDeployments();
                if (pending.length === 0) {
                    // no firmwareupdate needed. Throw NOT_MODIFIED error code
                    throw new NotModified();
                } else {
                    const deployment = pending[0];
                    let path = deployment.firmware.path;
                    if (!path.startsWith('/')) {
                        path = config.firmwares + '/' + path;
                    }
                    if (fs.existsSync(path)) {
                        return new Promise(function(resolve, reject) {
                            const stat = fs.statSync(path);
                            response.header('content-length', stat.size.toString());
                            response.header('content-type', 'application/octet-stream');
                            deployment.deploy();
                            resolve (fs.createReadStream(path));
                        })
                    } else {
                        throw new NotFoundError('firmware not found');
                    }
                }
            });
    }
}
