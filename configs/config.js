const config = {
    acl: 'http://localhost:1337',
    env: 'http://localhost:8080',
    jwt: null,
    headersAuth: {
        responseType: 'json',
        headers: {
            Authorization:
                'Bearer ',
        }
    }
};

module.exports = config;