export class RobotsTxt {
    state: State = {
        data: {
            groups: {},
            additional: []
        },
        valid: false
    }
    reGroupSep = /[\r\n]{2,}/gm
    validRuleNames = ['allow', 'disallow']
    validShareFormats = ['json', 'robotstxt']

    constructor (data = '') {
        if (data.length > 0) {
            this.parse(this.clean(data))
        }
    }

    newGroup(name: string, rules = []) {
        const self = this

        self.state.data.groups[name] = {rules: rules}

        return {
            allow: function(p: string | string[]) {
                p = !Array.isArray(p) ? [p] : p
                p.map((item) => (self.state.data.groups[name] as StateDataGroup).rules.push({allow: item}))
            },
            disallow: function(p: string | string[]) {
                p = !Array.isArray(p) ? [p] : p
                p.map((item) => (self.state.data.groups[name] as StateDataGroup).rules.push({disallow: item}))
            }
        }
    }

    newProduct(key: string, value: string) {
        this.state.data.additional.push({[key]: value})
        return this
    }

    load(obj: StateData) {
        this.state.data = obj
        this.state.valid = true
        return this
    }

    share(format = 'json') {
        if (format == 'json') return this.state.data
        if (format == 'robotstxt') return this.dump()

        throw new Error('Unsupported sharing format. Supported share formats are '+this.validShareFormats.join(', ')+' but you specified ' + format + '.')
    }

    dump() {
        const {groups, additional} = this.state.data

        let result = ''

        Object.keys(groups).map(function(name) {
            result += 'user-agent: ' + name + '\r\n';
            (groups[name] as StateDataGroup).rules.map(function(ruleobj) {
                const k = Object.keys(ruleobj)[0] as string
                result += k + ': ' + (ruleobj[k] as string) + '\r\n'
            })
            result += '\r\n'
        })

        additional.map(function(addobj) {
            const k = Object.keys(addobj)[0] as string
            result += k + ': ' + addobj[k] + '\r\n'
        })

        result = this.clean(result)

        return result
    }

    parse(data: string) {
        const groupMatches = data.split(this.reGroupSep)
        if (!groupMatches || groupMatches.length < 1) return this

        const validRuleNames = this.validRuleNames

        this.state.data = groupMatches.reduce(function(memo: StateData, groupData, ind) {
            const lines = groupData.split(/[\r\n]+/g)

            const isGroup = /((user-agent))/gi.test(lines[0] ?? '')
            if (ind === 0 && !isGroup) throw new Error('Document must have at least one group starting with "user-agent" at the beginning.')

            // const parent = isGroup ? 'groups' : 'additional'

            if (isGroup) {
                let gname = ''
                memo.groups = Object.assign({}, memo.groups, lines.reduce(function(lmemo: Record<string, any>, line) {
                    if (line.indexOf(':') === -1) throw new Error('Each group or rule line must contain a colon.')

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
        }, { groups: {}, additional: [] })

        this.state.valid = true

        return this
    }

    valid() {
        return this.state.valid
    }

    clean(data: string) {
        data = data.replace(/^[\r\n]+/g, '')
        data = data.replace(/[\r\n]+$/g, '')
        return data
    }
}

interface State {
    data: StateData
    valid: boolean
}

interface StateData {
    groups: Record<string, StateDataGroup>,
    additional: Record<string, any>[]
}

interface StateDataGroup {
    rules: Record<string, any>[]
}
