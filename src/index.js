function RobotsTXT(data) {
  this.state = {
    data: {
      groups: {},
      additional: []
    },
    valid: false
  }

  this.reGroupSep = /[\r\n]{2,}/gm
  this.validRuleNames = ['allow', 'disallow']
  this.validShareFormats = ['json', 'robotstxt']

  if (typeof data == 'string') this.parse(this.clean(data))
}

RobotsTXT.prototype.newGroup = function newGroup(name, rules = []) {
  const self = this

  self.state.data.groups[name] = {rules: rules}

  return {
    allow: function(p) {
      p = !Array.isArray(p) ? [p] : p
      p.map(item => self.state.data.groups[name].rules.push({allow: item}))
    },
    disallow: function(p) {
      p = !Array.isArray(p) ? [p] : p
      p.map(item => self.state.data.groups[name].rules.push({disallow: item}))
    }
  }
}

RobotsTXT.prototype.newProduct = function newProduct(key, value) {
  this.state.data.additional.push({[key]: value})
  return this
}

RobotsTXT.prototype.load = function load(obj) {
  this.state.data = obj
  this.state.valid = true
  return this
}

RobotsTXT.prototype.share = function share(format = 'json') {
  if (this.validShareFormats.indexOf(format) === -1)
    throw new Error('Unsupported sharing format. Supported share formats are '+this.validShareFormats.join(', ')+' but you specified ' + format + '.')

  if (format == 'json') return this.state.data

  if (format == 'robotstxt') return this.dump()

  return;
}

RobotsTXT.prototype.dump = function dump() {
  const {groups, additional} = this.state.data

  let result = ''

  Object.keys(groups).map(function(name) {
    result += 'user-agent: ' + name + '\r\n'
    groups[name].rules.map(function(ruleobj) {
      const k = Object.keys(ruleobj)[0]
      result += k + ': ' + ruleobj[k] + '\r\n'
    })
    result += '\r\n'
  })

  additional.map(function(addobj) {
    const k = Object.keys(addobj)[0]
    result += k + ': ' + addobj[k] + '\r\n'
  })

  result = this.clean(result)

  return result
}

RobotsTXT.prototype.parse = function parse(data) {
  const groupMatches = data.split(this.reGroupSep)
  if (!groupMatches || groupMatches.length < 1) return this

  const validRuleNames = this.validRuleNames

  this.state.data = groupMatches.reduce(function(memo, groupData, ind) {
    const lines = groupData.split(/[\r\n]+/g)

    const isGroup = /((user-agent))/gi.test(lines[0])
    if (ind === 0 && isGroup !== true)
      throw new Error('Document must have at least one group starting with "user-agent" at the beginning. Your document has none.')

    const parent = isGroup ? 'groups' : 'additional'

    if (isGroup) {
      let gname = null
      memo.groups = Object.assign({}, memo.groups, lines.reduce(function(lmemo, line) {
        if (line.indexOf(':') === -1)
          throw new Error('Each group or rule line must contain a colon.')

        const key = line.slice(0, line.indexOf(':')).toLowerCase().trim()
        const value = line.slice(line.indexOf(':') + 1).trim()

        if (key == 'user-agent') {
          lmemo[value] = {rules: []}
          gname = value
        }
        else if (validRuleNames.indexOf(key) !== -1) {
          lmemo[gname].rules.push({[key]: value})
        }
        else {}

        return lmemo
      }, {}))
    }
    else {
      memo.additional = lines.map(function(line) {
        const key = line.slice(0, line.indexOf(':')).trim()
        const value = line.slice(line.indexOf(':') + 1).trim()
        return {[key]: value}
      })
    }

    return memo
  }, {})

  this.state.valid = true

  return this
}

RobotsTXT.prototype.valid = function valid() {
  return this.state.valid
}

RobotsTXT.prototype.clean = function clean(data) {
  data = data.replace(/^[\r\n]+/g, '')
  data = data.replace(/[\r\n]+$/g, '')
  return data
}

module.exports = RobotsTXT
