export default {
    // Loglevel
    loglevel: process.env.LOGLEVEL || 'debug',

    // Secret key for JWT signing and encryption
    secret: process.env.SECRET || 'notSoSecret234oi23o423ooqnafsnaaslfj',

    // Setting port for server
    port: process.env.PORT || 80,

    // BaseUrl
    baseurl: process.env.BASEURL || 'http://localhost:' + this.port,
}
