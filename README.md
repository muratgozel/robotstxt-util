# robotstxt-util
RFC 5234 spec compliant robots.txt builder and parser. 🦾

![NPM](https://img.shields.io/npm/l/robotstxt-util)
[![npm version](https://badge.fury.io/js/robotstxt-util.svg)](https://badge.fury.io/js/robotstxt-util)

## Install
```sh
npm i -D robotstxt-util
```

## Use
Build robots.txt documents on fly:
```js
import RobotsTxt from 'robotstxt-util'
// or const RobotsTXT = require('robotstxt-util')

const builder = new RobotsTXT()
const somebot = builder.newGroup('somebot')
somebot.disallow('/')
// or builder.disallow('/', 'somebot')

const otherbots = builder.newGroup('*')
otherbots.allow('/app')
otherbots.disallow(['/api', '/data'])

// additional products:
builder.newProduct('Sitemap', 'https://test.com/en/sitemap.xml')
builder.newProduct('Sitemap', 'https://test.com/tr/sitemap.xml')
```
Parse existing robots.txt documents:
```js
const RobotsTXT = require('robotstxt-util')

const data = `

User-agent: Googlebot
Disallow: /nogooglebot/
Disallow: /api

User-agent: *
Allow: /
Disallow: /api

Sitemap: https://test.com/en/sitemap.xml
Sitemap: https://test.com/tr/sitemap.xml

`
const parser = new RobotsTXT(data)
parser.valid() // true|false
parser.share('json') // returns an object 👇
{
  groups: {
    Googlebot: {
      rules: [
        {disallow: '/nogooglebot/'},
        {disallow: '/api'}
      ]
    },
    '*': {
      rules: [
        {allow: '/'},
        {disallow: '/api'}
      ]
    }
  },
  additional: [
    {Sitemap: 'https://test.com/en/sitemap.xml'},
    {Sitemap: 'https://test.com/tr/sitemap.xml'}
  ]
}
parser.share('robotstxt') // returns spec compliant txt 👇
`
user-agent: Googlebot
disallow: /nogooglebot/
disallow: /api

user-agent: *
allow: /
disallow: /api

Sitemap: https://test.com/en/sitemap.xml
Sitemap: https://test.com/tr/sitemap.xml
`
```

##

## Parse Previously Exported Object
```js
const RobotsTXT = require('robotstxt-util')

const builder = new RobotsTXT()

const obj = {
  groups: {
    Googlebot: {
      rules: [
        {disallow: '/nogooglebot/'},
        {disallow: '/api'}
      ]
    },
    '*': {
      rules: [
        {allow: '/'},
        {disallow: '/api'}
      ]
    }
  },
  additional: [
    {Sitemap: 'https://test.com/en/sitemap.xml'},
    {Sitemap: 'https://test.com/tr/sitemap.xml'}
  ]
}

builder.load(obj)
```

## Contributing
If you're interested in contributing, read the [CONTRIBUTING.md](https://github.com/muratgozel/muratgozel/blob/main/CONTRIBUTING.md) first, please.

---

Version management of this repository done by [releaser](https://github.com/muratgozel/node-releaser) 🚀

---

Thanks for watching 🐬

[![Support me on Patreon](https://cdn.muratgozel.com.tr/support-me-on-patreon.v1.png)](https://patreon.com/muratgozel?utm_medium=organic&utm_source=github_repo&utm_campaign=github&utm_content=join_link)
