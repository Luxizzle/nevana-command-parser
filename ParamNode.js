var debug = require('debug')('parser-PN')
var emojiRegex = require('emoji-regex')

var NODE_TYPES = require('./NodeTypes.js')

var MATCH = {
    USER: {
        check: function(s) { return /<@\d+>/.test(s) },
        getVars: function(s) { 
             return {
                id: s.match(/\w+/g)[0]
            }  
        }
    },
    USER_NICK: {
        check: function(s) { return /<@!\d+>/.test(s) },
        getVars: function(s) { 
            return {
                id: s.match(/\w+/g)[0]
            } 
        }
    },
    CHANNEL: {
        check: function(s) { return /<#\d+>/.test(s) },
        getVars: function(s) { 
            return {
                id: s.match(/\w+/g)[0]
            } 
        } 
    },
    ROLE: {
        check: function(s) { return /<@\&\d+>/.test(s) },
        getVars: function(s) { 
            return {
                id: s.match(/\w+/g)[0]
            } 
        }
    },
    EMOJI: {
        check: function(s) { return emojiRegex().test(s) },
        getVars: function(s) { 
            return {
                name: s.match(emojiRegex())[0]
            } 
        }
    },
    CUSTOM_EMOJI:{
        check: function(s) { return /<:\w{2,}:\d+>/.test(s) },
        getVars: function(s) { 
            return {
                name: s.match(/\w+/g)[0],
                id: s.match(/\w+/g)[1]
            } 
        }
    }
}

class ParamNode {
    constructor(client, message, part) {
        var self = this
        this._client = client
        this._message = message

        this.raw = part

        switch (true) {
            case MATCH.USER.check(part):
                self.Type = NODE_TYPES.USER;
                self.Vars = MATCH.USER.getVars(part);
                self.User = self._client.Users.get(self.Vars.id);
                break;
            case MATCH.USER_NICK.check(part):
                self.Type = NODE_TYPES.USER;
                self.Vars = MATCH.USER_NICK.getVars(part);
                self.User = self._client.Users.get(self.Vars.id);
                break;
            case MATCH.CHANNEL.check(part):
                self.Type = NODE_TYPES.CHANNEL;
                self.Vars = MATCH.CHANNEL.getVars(part);
                self.Channel = self._message.guild.channels.find(function(c) { return c.id == self.Vars.id; });
                break;
            case MATCH.ROLE.check(part):
                self.Type = NODE_TYPES.ROLE;
                self.Vars = MATCH.ROLE.getVars(part);
                self.Role = self._message.guild.roles.find(function(r) { return r.id == self.Vars.id; });
                break;
            case MATCH.EMOJI.check(part):
                self.Type = NODE_TYPES.EMOJI;
                self.Vars = MATCH.EMOJI.getVars(part);
                break;
            case MATCH.CUSTOM_EMOJI.check(part):
                self.Type = NODE_TYPES.CUSTOM_EMOJI;
                self.Vars = MATCH.CUSTOM_EMOJI.getVars(part);
                self.Emoji = self._message.guild.emojis.find(function(e) { return e.id == self.Vars.id; });
                break;
        }

        debug(`New ParamNode "${part}" "${self.Type}" ${JSON.stringify(self.Vars)}`)

        return this
    }
}

module.exports = ParamNode