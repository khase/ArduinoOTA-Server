export default {
    // Loglevel
    loglevel: process.env.LOGLEVEL || 'debug',

    // Secret key for JWT signing and encryption
    secret: process.env.SECRET || 'notSoSecret234oi23o423ooqnafsnaaslfj',

    // Setting port for server
    port: process.env.PORT || 80,

    // Database
    dbConnectionDetails: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'espota',
        password: process.env.DB_PASSWORD || 'definitlynotsecret',
    },
    database: process.env.DB_NAME || 'espota',

    firmwares: process.env.FIRMWARE_DIR || '/firmwares',

    // BaseUrl
    baseurl: process.env.BASEURL || 'http://localhost:' + this.port,
}
