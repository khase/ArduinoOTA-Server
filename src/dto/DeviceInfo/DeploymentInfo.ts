import {FirmwareInfo} from './FirmwareInfo';
import {MyDB} from '../../services/MyDB';

export class DeploymentInfo {
    id: number;
    firmware: FirmwareInfo;
    triggered: Date;

    public deploy() {
        MyDB.setDeploymentTime(this, new Date());
    }
}
