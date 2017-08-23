//http module is needed to create server and listen for requests from GroupMe
const http = require('http');
//Bringing in the bots.
const hellobot = require('./bot.js');
var rickbot = require('./rick.js');
var garble = require('./garb.js');

//authKey, short for authentication key, is a string that is required to make a HTTP request to this server
const authKey = new RegExp('^\/'+'YOUR_AUTHENTICATION_KEY'+'$');

//creates a basic HTTP server using the built-in NodeJS http module
var server = http.createServer();

//setting up a callback for a request
server.on('request', function(req, res) {
  //It's reccomended that if you're going to use this bot in an enterprise environment, it's probably worth upgrading the security.
  //This is just so that you don't get random people trying your bot or soemthing, it's not what you'd call secure
  //Make sure to add YOUR_AUTHENTICATION_KEY onto the end of the Callback URL you give GroupMe, because that's what this if statement looks for
  if (!authKey.test(req.url)) return;

  //Handling the chunks of data the body may come in
  var body = [];
  req.on('data', chunk => body.push(chunk));
  req.on('end', function() {
    body = Buffer.concat(body).toString();

    //Converting the body from a string into JSON
    try {
      body = JSON.parse(body);
    } catch (e) {
      console.log(e);
      return
    }

    //Basic logging of any incoming GroupMe message
    console.log(body.name, " : ", body.text);

    //With this if statement, bots cannot trigger eachother
    if (body.sender_type != 'bot'){
      //Trigger word for the bot as a regular expression, after all, you only want the bot called intentionally, unless you're evil.
      if (/hello\W*bot/i.test(body.text)) {
        hellobot(body);
      }
      if (/Rick|#r/i.test(body.text)) {
        rickbot(body);
      }
      if (/^Garble|^#g/i.test(body.text)) {
        garble(body)
      }
    }

    //Fulfilling the response (with nothing in it), Heroku gets huffy if you don't
    res.end()
  });
  //process.env.PORT is an environment variable created by Heroku
  //therefore, listening on this port is necessary to work with Heroku
  //It will listen on port 3000 if process.env.PORT doesn't exist
}).listen(process.env.PORT || 3000);