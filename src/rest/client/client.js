const Client = require('node-rest-client').Client;
const config = require('./../../config/config');
const log = require('./../../log/logger');

function restClient() {
    this.client = new Client(config.restclient);
    this.client.on('error', function (err) {
        log.error('Something went wrong on the client = ' + err);
    });
}

restClient.prototype.getClient = function (options) {
    if (options) {
        var client = new Client(options);
        client.on('error', function (err) {
            log.error('Something went wrong on the client = ' + err);
        });
        return client;
    } else {
        return this.client;
    }
};

restClient.prototype.postReq = function (client, url, args, cb) {
    var cl = this.client;
    if (client) {
        cl = client;
    }
    const req = cl.post(url, args, function (data, response) {
        cb(data, response, null);
    }).on('error', function (err) {
        console.log('something went wrong on the request', err.request.options);
        cb(null, null, err);
    });

    req.on('requestTimeout', function (req) {
        console.log("request has expired");
        req.abort();
    });

    req.on('responseTimeout', function (res) {
        console.log("response has expired");
    });
};

module.exports = new restClient();