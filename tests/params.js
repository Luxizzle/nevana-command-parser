var Parser = require('../ParamParser')
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
         
client.Dispatcher.on("MESSAGE_CREATE", e => {
    var Result = new Parser(client, e.message, null, {})
    //console.log(Result)
    //debug(Result)
});

// @Merry Lux#1823 #general @coffee and tea @#C0FFEE#9143 :ok_hand: :gue: 
