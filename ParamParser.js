var debug = require('debug')('parser-PP')
var ParamNode = require('./ParamNode')

class ParamParser {
    constructor(client, message, content, options) {
        this.options = options
        this._client = client
        this._message = message

        this.content = content
        
        return this._generateNodes()
    }

    _generateNodes() {
        var self = this

        this.content_split = this.content.split(' ')

        this.nodes = []

        this.content_split.forEach(function(part) {
            self.nodes.push(new ParamNode(self._client, self._message, part))
        })

        return this.nodes
    }
}

module.exports = ParamParser