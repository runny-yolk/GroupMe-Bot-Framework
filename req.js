//This is a simple file that is just meant to do HTTP requests, and return the response object and body in a callback, since that's pretty useful
//There's a node module available to do this, but it has a ton of dependencies, and I built this with 0 dependencies, so
//Plus, I was just starting out when I made this, and you don't learn without a challenge
//Note that this hasn't been tested for robustness (not sure what it'd do if the request was sent to a host that didn't exist, for example), so use at your own risk

//Includes both the http and https modules, to be able to make both kinds of request
var http = require('http');
var https = require('https');

//The function that actually makes the request. I used to have two seperate http and https functions, but this is much easier in terms of maintenance.
//The http and https modules are parsed in as "type" from their respective functions declared below
function request(type, options, reqBody, callback){
    //Request object is created with options parsed in, and a callback function
    req = type.request(options, function(res){

        //Just like in the HTTP server in app.js, body is declared as an array, and then the chunks are pushed into it, then it's converted to a string
        var body = [];
        res.on('data', function(chunk) {
            body.push(chunk);
        }).on('end', function() {
            body = Buffer.concat(body).toString();
            
            callback(res, body);
        });
    });
    //reqBody is written to the body of the request
    req.write(reqBody);
    //Request is sent.
    req.end();
}


//The two functions below are the ones that actually get called. All they do is put the http or https module required above into a variable called "type" depending on which function is called
//along with the original parameters, type is parsed to request()

module.exports.http = function(options, reqBody, callback){
    var type = http;
    request(type, options, reqBody, callback);
}

module.exports.https = function(options, reqBody, callback){
    var type = https;
    request(type, options, reqBody, callback);
}