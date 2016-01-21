var Botkit = require('botkit')
var cleverbot = require('cleverbot.io');
var cb = new cleverbot('54NkGKDf0f8CwHJv','2X68ZWZi03jw8SkUQRrGKWKDwe0aDj3e');    // This is probably pretty stupid, but k.

// Expect a SLACK_TOKEN environment variable
var slackToken = process.env.SLACK_TOKEN
if (!slackToken) {
  console.error('SLACK_TOKEN is required!')
  process.exit(1)
}

var controller = Botkit.slackbot()
var bot = controller.spawn({
  token: slackToken
})
cb.create(function (err, session) {});

bot.startRTM(function (err, bot, payload) {
  if (err) {
    throw new Error('Could not connect to Slack')
  }
})

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "I'm here!")
})

controller.hears(['hello', 'hi'], ['direct_mention'], function (bot, message) {
  bot.reply(message, 'Hello!')
})

controller.hears(['hello', 'hi'], ['direct_message'], function (bot, message) {
  bot.reply(message, 'Hello!')
  bot.reply(message, 'It\'s nice to talk to you directly.')
})

controller.hears('.*', ['mention'], function (bot, message) {
  bot.reply(message, 'You really do care about me. :heart:')
})

controller.hears('help', ['direct_message', 'direct_mention'], function (bot, message) {
  var help = 'I will respond to the following messages: \n' +
      '`bot hi` for a simple message.\n' +
      '`bot attachment` to see a Slack attachment message.\n' +
      '`@<your bot\'s name>` to demonstrate detecting a mention.\n' +
      '`bot help` to see this again.'
  bot.reply(message, help)
})

controller.hears(['hey there'], ['direct_message', 'direct_mention'], function (bot, message) {
  bot.startConversation(message, function(err, convo) {
    convo.ask('Hey, how are you?', function(response, convo) {
      if (response.text == "exit") {
        convo.say("Nice knowing you " + response.user + "!");
        convo.stop();
      } else {
        console.log(response.text);
        var convo = convo;
        cb.ask(response.text, function (err, ans) {
          console.log(ans);
          convo.say(ans);
          convo.silentRepeat();
          convo.next();
        });
      }
    })
  });
})

controller.hears(['!flip'], ['direct_message', 'direct_mention'], function (bot, message) {
  if (Math.random() >= 0.5)
    bot.reply(message, 'Heads!')
  else
    bot.reply(message, 'Tails!')
})

controller.hears('.*', ['direct_message', 'direct_mention'], function (bot, message) {
  bot.reply(message, 'Sorry <@' + message.user + '>, I don\'t understand. \n')
})
