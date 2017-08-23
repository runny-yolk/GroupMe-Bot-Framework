//Requires msg.js as sendMsg, used to send messages to GroupMe
var sendMsg = require('./msg.js');

//This is where the GroupMe bot ID goes, use the ID of the bot you want to post as
botID = ''

//Exports this function, so you can call it from app.js
//The body of the request (where all the content is) is parsed in from app.js
module.exports = function(body){
    //Says hello to whoever said hello to it.
    sendMsg('Hello, '+body.name+'!', botID);
}