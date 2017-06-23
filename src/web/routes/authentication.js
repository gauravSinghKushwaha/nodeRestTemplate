const crypt = require('./../../common/encrypt');
const log = require('./../../log/logger');
const config = require('./../../config/config');
const restclient = require('./../../rest/client/client');
const express = require('express');
const auth = require('basic-auth');
const router = express.Router();

const UTF8 = 'utf8';
const HEX = 'hex';
const hashAlgo = config.encrypt.hashalgo == null ? 'sha256' : config.encrypt.hashalgo;
const salt = config.encrypt.salt == null ? '1@3$5^7*9)-+' : config.encrypt.salt;

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
    function postArg() {
        const args = {
            data: {
                "schema": "river",
                "table": "user",
                "operation": "search",
                "fields": [
                    "username",
                    "password",
                    "status",
                    "domain",
                    "resource"
                ],
                "where": {
                    "username": "user1498213881"
                },
                "limit": 200
            },
            user: "river-ejab",
            password: "1@3$5^7*9)-+",
            headers: {"Content-Type": "application/json"}
        };
        return args;
    }

    restclient.postReq(null, config.psurl + 'search', postArg(), function (data, resp, error) {
        if (error || error != null) {
            log.error(error);
            return res.status(500).send('something wrong at server')
        }
        log.debug('response : ' + resp.statusCode + ' Data : ' + JSON.stringify(data));
        if (resp.statusCode != 200) {
            if (data.hasOwnProperty("error")) {
                return res.send(data.error);
            } else {
                return res.send(resp.headers.status);
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

router.route('/password').get(function (req, res) {
    res.status(200).send('{password:password}');
});

/*
 apiRoutes.post('/authenticate', function(req, res) {

 // find the user
 User.findOne({
 name: req.body.name
 }, function(err, user) {

 if (err) throw err;

 if (!user) {
 res.json({
 success: false,
 message: 'Authentication failed. User not found.'
 });
 } else if (user) {

 // check if password matches
 if (user.password != req.body.password) {
 res.json({
 success: false,
 message: 'Authentication failed. Wrong password.'
 });
 } else {

 // if user is found and password is right
 // create a token
 var token = jwt.sign(user, app.get('superSecret'), {
 expiresInMinutes: 1440 // expires in 24 hours
 });

 // return the information including token as JSON
 res.json({
 success: true,
 message: 'Enjoy your token!',
 token: token
 });
 }

 }

 });
 });
 */
module.exports = router;
