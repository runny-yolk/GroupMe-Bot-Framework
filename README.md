# GroupMe Bot Framework
I created this awhile ago, so I could easily set up multiple bots on the same NodeJS application.

It comes with 3 bots: hellobot, rickbot, and garblebot.

Hellobot just says hello back to whoever says hello to it,
Rickbot tries to respond as Rick from Rick and Morty,
and Garblebot garbles the text you give it, by using Yandex Translate.

The code is commented heavily, only assuming a basic knowledge of JavaScript and NodeJS, although anything you don't know, the comments should give enough context for you to Google.

This application is also configured to be suitable for Heroku deployment, since this is my preferred deployment method.

## Adding a bot
The model that this is intended to work under, which you can see demonstrated, is that each bot is defined within its own .js file, which should have `module.exports` equal to a function that will process the body of the request (JSON that contains message information) and send a reply, using the function from msg.js, which I usually define as `sendMsg()`. Then, require this bot.js file within app.js, and create an `if` statement with a regular expression that defines what you want users to have to say to trigger the bot, and execute the bot function, parsing the body as an argument. Remember to configure the authentication key at the top of app.js, and give each bot a BotID, and you should be good to go.

Side note: I'd reccomend removing the bots that come with this project before starting your own, just to keep things clutter-free. Feel free to use them if you want to, though.
