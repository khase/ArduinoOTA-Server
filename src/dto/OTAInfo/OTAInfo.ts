import {Sketch} from './Sketch';
import {Chip} from './Chip';

export class OTAInfo {
    mode: string;
    staMac: string;
    apMac: string;
    sdkVersion: string;
    chip: Chip = new Chip();
    currentSketch: Sketch = new Sketch();
}
