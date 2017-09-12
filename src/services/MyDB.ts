import {createConnection, IConnection, IError, IFieldInfo} from 'mysql';
import * as fs from 'fs';
import * as path from 'path';
import config from '../config/main';
import * as winston from 'winston';
import {OTAInfo} from '../dto/OTAInfo/OTAInfo';
import {isNullOrUndefined} from 'util';
import {Device} from '../dto/Database/Device';
import {DeviceInfo} from '../dto/DeviceInfo/DeviceInfo';
import {DeploymentInfo} from '../dto/DeviceInfo/DeploymentInfo';
import {FirmwareInfo} from '../dto/DeviceInfo/FirmwareInfo';

export class MyDB {
    private static NOT_INITIALIZED = 'Database not initialized';

    private static db: IConnection;

    public static setup() {
        winston.info('connecting to databaseserver');
        return MyDB.initConnection().then(() => {
            winston.debug('checking database');
            return MyDB.initDB()
                .then(() => winston.debug('database ready'));
        });
    }

    private static checkConnection() {
        return new Promise(function (resolve, reject) {
            const start = new Date().getMilliseconds();
            MyDB.db.ping((err: IError) => {
                if (err != null) {
                    return reject(err);
                }
                return resolve(new Date().getMilliseconds() - start);
            });
        });
    }

    private static initConnection() {
        MyDB.db = createConnection(config.dbConnectionDetails);
        MyDB.db.on('error', function(err) {
            console.log(err); // 'ER_BAD_DB_ERROR'
        });
        return new Promise(function (resolve, reject) {
            MyDB.db.connect((err: IError) => {
                if (err != null) {
                    return reject(err);
                }
                return resolve();
            });
        });
    }

    private static initDB() {
        return MyDB.query('USE ' + config.database)
            .catch((err) => {
                winston.info('database <' + config.database + '> does not exist -> creating it....');
                return MyDB.query('CREATE DATABASE ' + config.database)
                    .then(() => {
                        winston.info('database created');
                        return MyDB.query('USE ' + config.database);
                    });
            })
            .then(() => {
                winston.debug('checking tables');
            })
            .then(() => {
                return MyDB.checkTableOrCreate('device', '../sql/createTableDevice.sql');
            })
            .then(() => {
                return MyDB.checkTableOrCreate('firmware', '../sql/createTableFirmware.sql');
            })
            .then(() => {
                return MyDB.checkTableOrCreate('deployment', '../sql/createTableDeployment.sql');
            })
            .then(() => {
                winston.debug('all tables ready.');
            });
    }

    private static checkTableOrCreate(tableName: string, sqlPath: string) {
        return MyDB.query('SELECT * FROM ' + tableName)
            .catch((err) => {
                winston.debug(tableName + ' does not exist');
                return MyDB.loadFile(sqlPath)
                    .then((data: string) => {
                        winston.debug('creating table ' + tableName);
                        return MyDB.query(data);
                    });
            })
            .then(() => {
                winston.debug(tableName + ' table ready');
            })
    }

    private static query(sql: string) {
        return MyDB.checkConnection()
            .catch(() => {
                MyDB.setup();
            })
            .then(() => {
                return new Promise(function (resolve, reject) {
                    MyDB.db.query(sql, (err: IError, results?: any, fields?: IFieldInfo[]) => {
                        if (err != null) {
                            return reject(err);
                        }
                        return resolve(results);
                    });
                });
            });
    }

    private static loadFile(file: string) {
        return new Promise(function (resolve, reject) {
            const filePath = path.join(__dirname, file);
            fs.readFile(filePath, 'utf8', function (err, data) {
                if (err != null) {
                    return reject(err);
                }
                return resolve(data);
            });
        });
    }

    public static loadDeviceInfo(device: OTAInfo): Promise<DeviceInfo> {
        return MyDB.query('UPDATE device ' +
            'SET lastseen=\'' + MyDB.mySQLDate(new Date()) + '\' ' +
            'WHERE mac=\'' + device.staMac + '\'')
            .then((result) => {
                if (result.affectedRows === 0) {
                    winston.info('device not found');
                    return MyDB.query('INSERT INTO device ' +
                        '(mac, currentversion, lastseen) VALUES (\'' +
                        device.staMac + '\' ,\'' +
                        device.currentSketch.versionInfo + '\' ,\'' +
                        MyDB.mySQLDate(new Date()) + '\')');
                }
            })
            .then(() => {
                return new DeviceInfo();
            })
            .then((info: DeviceInfo) => {
                return MyDB.query('SELECT * ' +
                    'FROM device ' +
                    'WHERE mac=\'' + device.staMac + '\'')
                    .then((result: Device[]) => {
                        info.id = result[0].id;
                        info.mac = result[0].mac;
                        info.name = result[0].name;
                        info.description = result[0].description;
                        info.lastSeen = result[0].lastseen;
                        info.currentVersion = result[0].currentversion;
                        info.lastError = result[0].lasterror;
                        info.deployments = [];
                        return info
                    });
            })
            .then((info: DeviceInfo) => {
                return MyDB.query('SELECT * ' +
                    'FROM (' +
                        'SELECT * ' +
                        'FROM deployment ' +
                        'WHERE device_id=' + info.id + ') AS deployment ' +
                    'JOIN firmware on firmware.id=deployment.firmware_id')
                    .then((result) => {
                        result.forEach(function (value) {
                            const depInfo = new DeploymentInfo();
                            const firInfo = new FirmwareInfo();
                            firInfo.description = value.description;
                            firInfo.hash = value.hash;
                            firInfo.size = value.size;
                            firInfo.path = value.path;
                            depInfo.firmware = firInfo;
                            depInfo.triggered = value.triggered;
                            info.deployments.push(depInfo);
                        })
                        return info;
                    });
            });
    }

    private static mySQLDate(date: Date) {
        return date.toISOString().slice(0, 19).replace('T', ' ');
    }
}
