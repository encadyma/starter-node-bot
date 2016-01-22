var Botkit = require('botkit')
var cleverbot = require('cleverbot-node');
var cb = new cleverbot;

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
  bot.startPrivateConversation(message, function(err, convo) {
    var help = 'I will respond to the following messages: \n' +
        '`@odysseus hey there` to talk to my inner AI.\n' +
        '`@odysseus hi` for a simple message.\n' +
        '`@odysseus help` to see this again.'
    convo.say(message, help);
    convo.next();
  });
})

controller.hears(['hey there'], ['direct_message', 'direct_mention'], function (bot, message) {
  bot.startPrivateConversation(message, function(err, convo) {
    var canned = ["How are you?", "Need something?", "What's up?", "How you doing?", "How's it going?", "What's the deal?"];
    convo.say(canned[Math.floor(Math.random()*canned.length)]);   // use Math.floor to prevent an undef 'canned.length' index
    cleverbot.prepare(function(){
      convo.ask('', function(response, convo) {
        if (response.text == "exit") {
          convo.say("Nice knowing you " + response.user + "!");
          cb = new cleverbot;
          convo.stop();
        } else {
          console.log("[QUESTION]", response.text);
          var convo = convo;
          var response = response;
          cb.write(response.text, function (ans) {
            console.log("[RESPONSE ("+ans.sessionid+")]", ans.message);
            convo.say(ans.message);
            convo.repeat();
            convo.next();
          });
        }
      });
    });
  });
})

controller.hears(['!flip'], ['direct_message', 'direct_mention'], function (bot, message) {
  if (Math.random() >= 0.5)
    bot.reply(message, 'Heads!')
  else
    bot.reply(message, 'Tails!')
})

controller.hears('.*', ['direct_message', 'direct_mention'], function (bot, message) {
  bot.startPrivateConversation(message, function(err, convo) {
    convo.say('Sorry <@' + message.user + '>, I don\'t understand. \n');
    convo.next();
  });
})
