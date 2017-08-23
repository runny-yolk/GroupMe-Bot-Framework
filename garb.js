//This is Garblebot. As you'd expect, it takes whatever text you give it, and garbles it. It's often pretty funny, especially if you use song lyrics.

//sendMsg is needed to send messages to GroupMe
var sendMsg = require('./msg.js');
//req.js is a simple file I made for making http or https requests, and recieving the response in a callback
var httpsReq = require('./req.js').https;

//The GroupMe bot ID of the bot you want to use (Required to post to GroupMe)
var botID = ''
//Yandex Translate authentication key (Required to translate/garble stuff)
var key = ''

//Options for HTTPS requests to Yandex Translate
options = {
    host: 'translate.yandex.net',
    path: '',
    method: 'GET'
};

//Function that takes the output of Yandex Translate and makes it into a useful string
function makeText(text) {
    text = JSON.parse(text);
    text = text.text[0];
    console.log(text);
    return text;
}

//Executed by app.js, when this bot's trigger is said in the groupchat
module.exports = function(body) {

    //Removes the prompt to Garblebot before sending translate request to Yandex
    var text = body.text.replace(/Garble|#g/i, '')

    //Sets the path of the request options to have the Yandex Translate authentication key and GroupMe request text as querystrings
    //As you can see from the &lang=en-th at the end there, this one does English to Thai.
    // Visit https://tech.yandex.com/translate/doc/dg/concepts/api-overview-docpage/ for a full list of languages you can translate in/out of
    options.path = '/api/v1.5/tr.json/translate?key='+key+'&text='+encodeURIComponent(text)+'&lang=en-th'
    httpsReq(options, '', function(res, body){
        options.path = '/api/v1.5/tr.json/translate?key='+key+'&text='+encodeURIComponent(makeText(body))+'&lang=th-ru';
        httpsReq(options, '', function(res, body){
            options.path = '/api/v1.5/tr.json/translate?key='+key+'&text='+encodeURIComponent(makeText(body))+'&lang=ru-ar';
            httpsReq(options, '', function(res, body){
                options.path = '/api/v1.5/tr.json/translate?key='+key+'&text='+encodeURIComponent(makeText(body))+'&lang=ar-la';
                httpsReq(options, '', function(res, body){
                    options.path = '/api/v1.5/tr.json/translate?key='+key+'&text='+encodeURIComponent(makeText(body))+'&lang=la-ja';
                    httpsReq(options, '', function(res, body){
                        options.path = '/api/v1.5/tr.json/translate?key='+key+'&text='+encodeURIComponent(makeText(body))+'&lang=ja-en';
                        httpsReq(options, '', function(res, body){
                            //After translating from Japanese and back into English, the text is probably pretty garbled.
                            //A request is sent to GroupMe with the resulting text, and Garblebot's botID defined above
                            sendMsg(makeText(body), botID);
                        })
                    })
                })
            })
        })
    })

}