# 🔗 @layered/superurl

**@layered/superurl** is a JavaScript library that can clean and extract info from URLs.

### Highlights
* Removes tracking parameters
* Adds protocol if missing, upgrades to https if domain requires it
* Extracts infos (handle, IDs, usernames) from URLs without network requests

## Getting Started

#### Installation

```npm i @layered/superurl```

#### Usage
```js
const { sanitizeUrl, urlInfo } = require('@layered/superurl')

const cleanUrl = sanitizeUrl('example.com/path?utc_campaign=upgrade')
// returns https://example.com/path

const infos = sanitizeUrl('http://twitter.com/elonmusk')
// returns
{
	originalUrl: 'http://mobile.twitter.com/elonmusk',
	url: 'https://twitter.com/elonmusk',
	hostname: 'twitter.com',
	domain: 'twitter.com',
	subdomain: '',
	handle: 'elonmusk',
	providerId: null,
}
```

## APIs
- [`sanitizeUrl(url, options)`](#sanitize-url) - Sanitize/clean URL
- [`urlInfo(url, options)`](#url-info) - Extract data from URL

### Sanitize URL
Sanitize/clean URL

`sanitizeUrl(url: string | URL, options): string`
- `url` - URL to sanitize, can be string or [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL). Ex: 'google.com'
- `options` - Object of options to use, all optional:
	- `allowedProtocols[]` - What protocols are allowed for URL. Default: `['http:', 'https:']`

### URL info
Extract data from URL, without network requests.

`urlInfo(url: string | URL, options): string`
- `url` - URL to check, can be string or [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL). Ex: 'twitter.com/twitter'
- `options` - Object of options to use, all optional:
	- `allowedProtocols[]` - What protocols are allowed for URL. Default: `['http:', 'https:']`

## More

Please report any issues here on GitHub.
[Any contributions are welcome](CONTRIBUTING.md)

## License

[MIT](LICENSE)

Copyright (c) Andrei Igna, Layered
