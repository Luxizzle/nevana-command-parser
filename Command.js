var debug = require('debug')('parser-C')

var NODE_TYPES = require('./NodeTypes.js')

class Command {
    constructor(client, aliases, name, options) {
        aliases = (Array.isArray(aliases)) ? aliases : [aliases]
        options = options || {}
        this.name = name
        this.aliases = aliases
        this.desc = options.desc || ''
        this.order = options.order || 0
        this.params = []
        this.stack = options.callback ? [options.callback] : []
        this.help = function(out, msg, params) {
            var self = this
            out.embed({
                author: {
                    name: self.name,
                    url: `http://lux.moe/bot`,
                    icon_url: client.User.avatarURL
                },
                description: self.desc,
                fields: [
                   {name: 'Aliases', value: self.aliases.join(', '), inline: true},
                   {name: 'Parameters', value: self.stringifyParams(true), inline: true}
                ],
                color: 0xC0FFEE
            })
        }

        this._client = client

        debug('Created new Command (' + this.name + ')')

        return this
    }

    param(config) {
        var param = {
            name: config.name,
            type: config.type || null,
            optional: (config.optional == null) ? true : config.optional,
        }

        this.params.push(param)

        debug(`Added new param (${config.name}) to ${this.name}`)

        return this
    }

    stringifyParams(advanced) {
        var self = this

        var result = ''

        this.params.forEach((param) => {
            if (advanced) {
                result += (param.optional == true) ? '[' : '';
                result += '**'+ param.name +'**' + (param.type ? ` (${param.type})` : ``);
                result += (param.optional == true) ? ']' : '';
            } else {
                result += param.optional == true ? '[' : ''
                result += '**'+ param.name +'**'
                result += param.optional == true ? ']' : ''
            }
            result += ' '
        })
        return result
    }

    callback(fn) {
        if (typeof fn !== 'function') throw new Error('callback expects a function');

        this.stack.push(fn)

        debug(`Added new callback to ${this.name}`)

        return this
    }

    helpfn(fn) {
        if (typeof fn !== 'function') throw new Error('callback expects a function');

        this.help = fn

        return this
    }
}

module.exports = Command;