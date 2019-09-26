import 'reflect-metadata';
import {createExpressServer} from 'routing-controllers';
import * as morgan from 'morgan';
import * as winston from 'winston';
import {Express} from 'express';
import config from './config/main';
import {MyDB} from './services/MyDB';

/**
 * Root class of your node server.
 * Can be used for basic configurations, for instance starting up the server or registering middleware.
 */
export class Server {

    public app: Express;

    constructor() {
        // Do not use mpromise

        this.app = createExpressServer({
            routePrefix: '',
            controllers: [__dirname + '/controllers/*.js'], // register all controller's routes
        });
    }

    start() {
        MyDB.setup()
            .catch((err) => {
                winston.error('Could not connect to DB');
                winston.error(err);
            })
            .then(() => {

                // Request logger
                this.app.use(morgan('combined', {
                    skip: function (req, res) {
                        return res.statusCode < 400
                    }
                }));

                this.app.listen(config.port, () => {
                    winston.log('info', '--> Server successfully started at port %d', config.port);
                });
            })
            .catch((err) => {
                process.exit(1);
            });
    }
}

/**
 * For testing mocha will start express itself
 */
if (process.env.NODE_ENV !== 'test') {
    new Server().start();
}
