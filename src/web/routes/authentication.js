const crypt = require('./../../common/encrypt');
const log = require('./../../log/logger');
const config = require('./../../config/config');
const restclient = require('./../../rest/client/client');
const express = require('express');
const auth = require('basic-auth');
const router = express.Router();
const ACTIVE = 'active';
const CONTENT_TYPE_JSON = "application/json";
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
        log.warn('basic auth failed, access denied for api . credentials = ' + credentials);
        res.status(401);
        res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
        return res.send({msg: 'Access denied'});
    }
    next();
});

router.route('/authenticate').post(function (req, res) {
    const body = req.body;
    log.debug('request body = ' + JSON.stringify(body));

    function arg(username) {
        return {
            path: {"username": username},
            data: {},
            parameters: {},
            user: config.restclient.user,
            password: config.restclient.password,
            headers: {"Content-Type": CONTENT_TYPE_JSON}
        }
    }

    restclient.getReq(undefined, config.psurl, arg(body.username), function (err, data, resp) {
        if (err) {
            log.error(err);
            return res.status(500).send({error: 'something gone wrong at server'});
        }
        log.debug('response statusCode : ' + resp.statusCode);
        if (resp.statusCode != 200) {
            log.error('Status code = ' + resp.statusCode + ' data = ' + data);
            return res.status(resp.statusCode).send(( data && (Object.keys(data)).length > 0) ? data : {error: 'could not get user from server!!'});
        } else {
            if (data && data.length == 1 && data[0].username == req.body.username && data[0].status == ACTIVE && data[0].domain == req.body.domain && data[0].password == body.password) {
                return res.status(200).send({success: true});
            } else {
                log.debug('authentication failed');
                return res.status(401).send();
            }
        }
    });
});

module.exports = router;
