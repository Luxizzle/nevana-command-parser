var ParamParser = require('./ParamParser')
var Command = require('./Command')
var debug = require('debug')('parser-CP')

class CommandParser {
    constructor(client, options) {
        var self = this
        options = options || {}
        this.options = {
            //separator: options.separator || ' ',
            prefix: options.prefix || client.User.mention + ' ',
            ignoreSelf: (options.ignoreSelf == null) ? true : options.ignoreSelf,
            channelBlacklist: options.channelBlacklist || []
        }

        this.commands = []

        this._client = client

        // HELP COMMAND

        this
            .command(['help', 'h'], 'help', {
                desc: 'Gives information about the commands',
                order: -1
            })
            .param({
                name: 'command',
                optional: true
            })
            .callback(function(out, msg, params) {
                if ( params[0] && out._parser.getCommand(params[0].raw) ) {
                    var name = params[0].raw
                    var cmd = out._parser.getCommand(name)
                    
                    cmd.help.call(cmd, out, msg, [])

                    return;
                } 

                out.reply('Currently no help implemented')
            })

        debug('Created new CommandParser')

        return this
    }

    command(aliases, name, options) {
        var cmd = new Command(this._client, aliases, name, options)

        this.commands = this.commands.filter((obj) => {
            return obj.name !== name
        })

        this.commands.push(cmd)

        return cmd
    }

    getCommand(name) {
        return this.commands.find((cmd) => {
            if (cmd.name == name) return true;
            if (cmd.aliases.find((alias) => { alias == name })) return true;
            return false
        })
    }

    parse(message) {
        var self = this
        if (this.options.ignoreSelf && message.author.id == this._client.User.id) return this;
        if (
            this.options.channelBlacklist.length > 0  
         && this.options.channelBlacklist.find((c) => {return c.id == message.channel.id})
        ) { return this };
        if (message.content.indexOf(self.options.prefix) != 0) return this;

        var content = message.content.substring(self.options.prefix.length).trim()
        var commandAlias = content.match(/\w+/)[0]
        content = content.substring(commandAlias.length + 1)


        var nodes = new ParamParser(this._client, message, content, this.options)

        var outStack = {
            _parser: self,
            raw: function(r) {
                message.channel.sendMessage(r)
            },
            reply: function(r, e) {
                message.channel.sendMessage(
                    message.author.mention + ', ' + (r || ''),
                    null,
                    e || null
                )
            },
            embed: function(e) {
                message.channel.sendMessage(
                    '',
                    null,
                    e
                )
            }
        }

        var cmd = this.getCommand(commandAlias)
        if (cmd == undefined) {
            outStack.reply(`That command doesn't exist, try lookin for the right one with the help command.`)
            return self;
        }

        cmd.stack.forEach((cb) => {
            cb.call(cmd, outStack, message, nodes)
        })

        return this
    }
}

module.exports = CommandParser;
