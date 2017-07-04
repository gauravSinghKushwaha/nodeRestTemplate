const crypt = require('./../../common/encrypt');
const log = require('./../../log/logger');
const config = require('./../../config/config');
const restclient = require('./../../rest/client/client');
const express = require('express');
const auth = require('basic-auth');
const router = express.Router();

/**
 * Middleware woudl be used for authentication
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
router.use(function timeLog(req, res, next) {
    var credentials = auth(req);
    if (!credentials || credentials.name != config.apiauth.user || credentials.pass != config.apiauth.pwd) {
        log.warn('access denied for credentials = ' + credentials.name + ' pwd = ' + credentials.pass);
        res.status(401);
        res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
        return res.send('{success:Access denied}');
    }
    next();
});

router.route('/authenticate').post(function (req, res) {
    log.debug('request body = ' + JSON.stringify(req.body));
    const hash = crypt.hashText(req.body.password);
    log.debug(hash);

    function arg(username) {
        const args = {
            path: {"username": username},
            data: {},
            parameters: {schema: "river", table: "user"},
            user: "river-ejab",
            password: "1@3$5^7*9)-+",
            headers: {"Content-Type": "application/json"}
        };
        return args;
    }

    restclient.getReq(null, config.psurl, arg(req.body.username), function (data, resp, error) {
        if (error || error != null) {
            log.error(error);
            return res.status(500).send('something wrong at server')
        }
        log.debug('response : ' + resp.statusCode + ' Data : ' + JSON.stringify(data));
        if (resp.statusCode != 200) {
            if (data.hasOwnProperty("error")) {
                return res.send(data.error);
            } else {
                return res.status(resp.statusCode).send({'error': 'could not fetch data from persistence server!!'});
            }
        } else {
            if (data && data.length == 1 && data[0].username == req.body.username && data[0].status == 'active' && data[0].domain == req.body.domain && data[0].password == hash) {
                return res.status(200).send('{success:true}');
            } else {
                log.debug('authentication failed');
                return res.status(401).send();
            }
        }
    });
});

module.exports = router;
