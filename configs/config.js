const config = {
    acl: 'http://localhost:1337',
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