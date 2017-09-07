import {createConnection, IConnection, IError} from 'mysql';
import * as fs from 'fs';
import * as path from 'path';
import config from '../config/main';
import * as winston from 'winston';

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
                    .then((data) => {
                        winston.debug('creating table ' + tableName);
                        return MyDB.query(data);
                    });
            })
            .then(() => {
                winston.debug(tableName + ' table ready');
            })
    }

    private static query(sql: string) {
        return new Promise(function (resolve, reject) {
            MyDB.db.query(sql, (err: IError, results?: any) => {
                if (err != null) {
                    return reject(err);
                }
                return resolve(results);
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


}
