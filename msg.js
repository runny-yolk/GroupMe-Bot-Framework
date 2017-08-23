//GroupMe only takes https, so this file uses the https function of req.js
var httpsReq = require('./req.js').https;

//These are the parameters required to post a message to GroupMe as a bot
var msgOptions = {
  host: 'api.groupme.com',
  path: '/v3/bots/post',
  method: 'POST'
}

//The function that's exported takes 3 parameters - the text you want to post, the botID, and the url of an image as a string. This last one is optional.
module.exports = function(text, bot_id, picture_url){

  //Ensures that pic exists, so that the app doesn't crash when 'stuff' is created
  if (!picture_url) var picture_url = '';

  //Creating the body of the message to go to GroupMe, with the parameters included, using ES6 JSON definition
  // All you have to do is put in the variable names, and the resulting JSON will have the name and value of each variable that's put in
  var stuff = {
    text,
    botID,
    picture_url
  };
  
  //Sending the request with the options defined at the top of the file, and a JSON to string conversion of the "stuff" variable
  //Also has a callback that logs the status code and body, since GroupMe includes error messages in the body.
  httpsReq(msgOptions, JSON.stringify(stuff), function(res, body){
    console.log(res.statusCode);
    console.log(body);
  })

}