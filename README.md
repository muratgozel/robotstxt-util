# robotstxt-util
RFC 9309 spec compliant robots.txt builder and parser. 🦾 No dependencies, fully typed.

![NPM](https://img.shields.io/npm/l/robotstxt-util)
[![Build status](https://badge.buildkite.com/59019ef6df1cc44bcb5b790bd21f198d1e488c842624c62cd8.svg)](https://buildkite.com/gozel/robotstxt-util)

## Install
```sh
npm i robotstxt-util
```

## Use
Exports a parser `parseRobotsTxt` and an object `RobotsTxt` to create and manage robots.txt data.

### Create robots.txt
```js
import { RobotsTxt } from 'robotstxt-util'

const robotstxt = new RobotsTxt()

const allBots = robotstxt.newGroup('*')
allBots.disallow('/')

const googleBot = robotstxt.newGroup('googlebot')
googleBot.allow('/abc')
googleBot.disallow('/def')

// specify multiple bots
const otherBots = robotstxt.newGroup(['abot', 'bbot', 'cbot'])
googleBot.allow('/qwe')
// specify custom rules
googleBot.addCustomRule('crawl-delay', 10)

// add sitemaps
robotstxt.add('sitemap', 'https://yoursite/sitemap.en.xml')
robotstxt.add('sitemap', 'https://yoursite/sitemap.tr.xml')

// and export
const json = robotstxt.json()
const txt = robotstxt.txt()
```

### Parse robots.txt data
Parses the data and returns instance of `RobotsTxt`:
```js
import { parseRobotsTxt } from 'robotstxt-util'

const data = `
# hello robots

User-Agent: *
Disallow: *.gif$
Disallow: /example/
Allow: /publications/

User-Agent: foobot
Disallow:/
crawl-delay: 10
Allow:/example/page.html
Allow:/example/allowed.gif

# comments will be stripped out

User-Agent: barbot
User-Agent: bazbot
Disallow: /example/page.html

Sitemap: https://yoursite/sitemap.en.xml
Sitemap: https://yoursite/sitemap.tr.xml
`
const robotstxt = parseRobotsTxt(data)

// store as json or do whatever you want
const json = robotstxt.json()
```

## Contributing
If you're interested in contributing, read the [CONTRIBUTING.md](https://github.com/muratgozel/muratgozel/blob/main/CONTRIBUTING.md) first, please.

---

Thanks for watching 🐬
