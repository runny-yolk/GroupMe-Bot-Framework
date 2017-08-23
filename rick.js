//This is Rickbot. It uses the IMDb quotes page for Rick Sanchez, of Rick and Morty fame, to try and respond as Rick the best it can.
//It will start by searching from the last place there was a successful search, to try to be conversational
//If it comes up empty, it'll try to match your prompt to a Rick quote and respond with that.

//sendMsg is needed to send messages to GroupMe
var sendMsg = require('./msg.js');
//req.js is a simple file I made for making http or https requests, and recieving the response in a callback
var httpReq = require('./req.js').http;

//Since the IMDb page is requested asynchronously on startup, and is required for Rickbot to run, this variable was created
//It's so you can know if Rick is ready to take a request, as the quotes, quotesmaster, and RickQuotes variables which are necessary, won't exist until the IMDb page has been downloaded and processed
//Ready is set to true and console logged when Rickbot is ready for use
var ready = false;
//For easier if statements, lastpos is set to false on declaration, and if a request doesn't return a quote
var lastpos = false;
//The GroupMe bot ID of the bot you want to post with
var botID = "";

//Options to get the Rick quotes from IMDb
reqOptions = {
  host: 'www.imdb.com',
  path: '/character/ch0432422/quotes',
  method: 'GET'
};

//Request is made
httpReq(reqOptions, '', function(res, body){

    //Incase the page is moved, provides indication that the request went smoothly
    console.log(res.statusCode);

    //start is the start of the useful information. It's long to ensure that it's unique
    var start = "users. It has not been screened or verified by IMDb staff.</div>";
    var startpos = body.search(start) + start.length;
    //Slices off the useless info above the start variable, along with the variable
    quotes = body.slice(startpos);
    //<br clear="both" /> comes after the useful stuff, so this gets rid of everything below and including it
    quotes = quotes.slice(0, quotes.indexOf('<br clear="both" />'));

    //Replaces apostrophes (which comes through as "&#x27;") with an escaped apostrophe, so it comes out as an actual apostrophe when posted to chat
    quotes = quotes.replace(/&#x27;/g, '\'');
    //I prefer asterisks for actions (stage directions)
    quotes = quotes.replace(/\[|\]/g, '*');
    //Removes all the HTML stuff that comes with downloading the page, with the exception of <br/>, as it makes for a useful marker between items
    quotes = quotes.replace(/<\/a>|<i>|<\/i>|<a.{24}>|<a.{25}>| Sanchez|&#x22;|<h5>.*<\/h5>|<hr\/>|\n/g, '');

    //Since quotes is modified to make the searching process easier, a duplicate is created to reset it
    quotesmaster = quotes;

    //Creates an array of quotes/actions, split on the <br>, so random quotes can be done
    quoteArray = quotes.split('<br/>');

    //Creates an empty array meant to contain all of Rick's quotes, then pushes them in from the quoteArray
    rickQuotes = [];
    for (var i = 0; i < quoteArray.length; i++) {
        if (/Rick:/i.test(quoteArray[i])) {
            rickQuotes.push(quoteArray[i].replace(/rick:\s*/ig, ''));
        }
    }

    ready = true;
    console.log(ready);
})


function getQuote(prompt) {
    //This is the important function, the one that does the stuff
    //It's important to note that some decisions here may seem odd, because this is made to find Rick's immediate response to something that's been said
    //Not just the next thing he says that's on the page.

    //ready is false if the above request isn't complete
    //Note here, that the function that calls this (module.exports) expects an array
    //or rather, you can give it a string, but then it'll print out each character individually
    if (!ready) return ['Fuck off! Not ready!'];

    //Picks a random item from the rickQuotes array and returns it
    if (/rando/i.test(prompt)) {
        var item = [rickQuotes[Math.floor(Math.random()*rickQuotes.length)]];
        return item
    }

    //Formats the text for a regular expression, made lowercase for consistency
    text = prompt.toLowerCase();
    //Converts all spaces and punctuation to \W*, or "0 or more non-word characters", to broaden the search criteria
    text = text.replace(/[.,\/#!$%\^&\*;:{?}=\-_`'~()]|\s/g,'\\W*');
    //Declares a new regular expression, with the i flag, so it can match to upper or lowercase text
    re = new RegExp(text, 'i');

    //Ensures that quotes is always complete before searching
    quotes = quotesmaster
    
    //Checks for whether the requested text even exists in the quotes string, returns false if not, and sets lastpos back to false
    if (!re.test(quotes)){console.log('Invalid search'); lastpos = false; return false};

    if (lastpos) {

        //If lastpos either exists or isn't false, the quotes variable is then sliced to start from there
        quotes = quotes.slice(lastpos);

        if (re.test(quotes)) {
            //If testing from lastpos returns true, finds the first occourence of <br/> after the matched quote, and creates a variable called start to record that position
            var start = quotes.indexOf('<br/>', quotes.search(re));
            //start has 5 added to it because <br/> is 5 characters
            start += 5;
            //Sets lastpos equal to start, for next time round
            lastpos = start;
        } else {
            //If testing from lastpos returns false, then quotes is reset to be complete
            //We alrady know that the request at least exists in quotes, as one of the first things we do is test quotes for the request
            quotes = quotesmaster;
            //Finds the first occourence of <br/> after the matched quote, and creates a variable called start to record that position
            var start = quotes.indexOf('<br/>', quotes.search(re));
            //start has 5 added to it because <br/> is 5 characters
            start += 5;
            lastpos = false;
        }

    } else {
        //Executed if lastpos is false or doesn't exist
        var start = quotes.indexOf('<br/>', quotes.search(re));
        start += 5;
        lastpos = start;
    }


    //If Rick says something after the matched position, then the next 4 characters after start should be Rick
    if (quotes.substr(start, 4) == 'Rick') {
        //Formatting and removal of anything extraneous
        start += 8;
        quote = quotes.slice(start);
        quote = quote.slice(0, quote.search(/<br\/>(?!Rick| |\*|\n)/));
        quote = quote.replace(/Rick:\s*|\n/g, '');
        //Splitting on each <br/>, to make each Rick quote/action a seperate entry into the array, for when Rick has multiple quotes/actions as part of a single interaction
        quote = quote.split('<br/>');
    } else {
        //If Rick hasn't said something after the matched position, then the only other possibility is it's something that Rick said
        start = quotes.lastIndexOf(':', start);
        //Although the only possibility is that the matched quote is something said by Rick, this if statement is done to ensure something not said by Rick isn't returned
        if (quotes.substr(start-4, 4) == 'Rick') {
            //Formatting and removal of anything extraneous
            start += 4;
            quote = quotes.slice(start);
            quote = quote.slice(0, quote.search(/<br\/>(?!Rick| |\*|\n)/));
            quote = quote.replace(/Rick:\s*/g, '');
            //Splitting on each <br/>, to make each Rick quote/action a seperate entry into the array, for when Rick has multiple quotes/actions as part of a single interaction
            quote = quote.split('<br/>');
        } else {
            return false;
        }
    }

    return quote;
};

//Executed by app.js, when this bot's trigger is said in the groupchat
module.exports = function(body) {

    //Removes prompt from the text before searching on it to get a Rick quote back
    var text = body.text.replace(/.*Rick|.*#r/i, '')
    var quote = getQuote(text);

    //if(quote) means a message will only be sent if quote exists or is not false
    //Note that quote is returned as an array
    if (quote){
        //This is where it gets interesting.
        //If you created a for loop, as I have done below, and used that to send them one after the other in the code, the messages would arrive in a jumbled order
        //or rather, the order they arrive in, and each one will take a different amount of time to travel to GroupMe's server from yoursd
        //With that in mind, each message has to be sent with a gap of a few hundered milliseconds (basically anything greater than the travel time, though), to ensure that they arrive in the intended order
        //setTimeout can be used for this. However, if you just put setTimeout in the for loop, then it will fail
        //This is because setTimeout is executed asynchronously, and that for loop is synchronous
        //This means that the for loop completes, and i is equal to 1 higher than the last index in the array, which of course, doesn't exist, so when the setTimeout executes and calls quote[i], it fails
        //So then, a seperate instance of i needs to be created for each setTimeout to send when their timer expires
        //This is achieved by creating a wrapper function, as a seperate instance of i is created for each call of the function
        //Code for this below.

        // function doSetTimeOut(i) {
        //     setTimeout(function() {
        //     sendMsg(quote[i], botID);
        //     }, 500*i, quote);
        // }

        // for (var i = 0; i < quote.length; i++) {
        //     doSetTimeOut(i);
        // }   


        //The reason why that code above is commented out is because I realised after revisiting this code to write these comments, using setInterval would be a much better way of doing it
        var i = 0;
        //When setInterval is run, and an interval is created, it returns an Interval ID. This can then be used to clear the interval later on.
        var intervals = setInterval(function(){
            //First thing it does is makes sure the index number doesn't exceed the length of the quote array. If it does, then the interval is cleared so that it won't run again, and the function returns
            if (!quote[i]) {clearInterval(intervals); return;}
            //Sends message containing the text of the quote, and the GroupMe bot ID, stepping through each item in the array with the i variable
            sendMsg(quote[i], botID);
            i++;
        }, 500, quote, i);
    }
}