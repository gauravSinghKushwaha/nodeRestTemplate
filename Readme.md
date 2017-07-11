                                            **Authentication Server**

A NodeJs express based rest module. With following feature

1) takes properties file as console input. you could give full path like d:\\abc\\xyz.properties Or only property file name like xyz.properties. In case of later it will look for file in resouces folder under config.
2) run the sever using cluster module, creates logs.cluster.childprocess many child process for handling rest requests.
3) Use basic auth for api caller authentication, use credentials given in properties file as of now.
4) use SHA-256 for password verification of user given in payload
5) logs access logs in directory and file mentioned in config file.
6) log level of application logs could be controlled from config. e.g warn,debug,info,error
7) all the routes are mentioned in routes folder
8) server running port could be changed from config along with api's versioning

**Usage :**

1)

POST /river/v1/authenticate HTTP/1.1
Host: localhost:9090
Content-Type: application/json
Authorization: Basic cml2ZXItZWphYjoxQDMkNV43KjkpLSs=
Cache-Control: no-cache
Postman-Token: c57caa30-c930-4e36-8e8b-21d2d88718b1

{
 "username": "User",
 "password": "Password",
 "domain": "river",
 "resource": "Resource"
}
