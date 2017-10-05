import {DeploymentInfo} from './DeploymentInfo';
import {isNullOrUndefined} from 'util';

export class DeviceInfo {
    id: number;
    mac: string;
    name: string;
    description: string;
    lastSeen: Date;
    currentVersion: string;
    lastError: string;
    deployments: DeploymentInfo[];

    public getPendingDeployments(): DeploymentInfo[] {
        const pendingDepoyments: DeploymentInfo[] = [];
        this.deployments.forEach(function (value: DeploymentInfo) {
            if (isNullOrUndefined(value.triggered)) {
                pendingDepoyments.push(value);
            }
        });
        return pendingDepoyments;
    }
}
