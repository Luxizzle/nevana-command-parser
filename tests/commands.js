var CommandParser = require('../CommandParser')
var Discordie = require('discordie')
var debug = require('debug')('test')
var client = new Discordie()

debug('Connecting')

client.connect({
    token: require('./auth.js')
})

client.Dispatcher.on('GATEWAY_READY', e => {
    debug('Connected')
})

var Parser = new CommandParser(client, { prefix: '`' })

Parser
    .command('ping', 'ping', {
        desc: ':ping_pong: Pings to check if the bot is online'
    })
    .param({
        name: 'User', 
        type: 'User',
        optionsal: false
    })
    .callback(function(out, msg, params) {
        out.reply('pong!')
    });

client.Dispatcher.on("MESSAGE_CREATE", e => {
    Parser.parse(e.message)
});