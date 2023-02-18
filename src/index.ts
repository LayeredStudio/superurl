const { getDomain, parse } = require('tldts')

interface SanitizeUrlOptions {
	allowedProtocols?: string[];
}

const hostnameRewrites: {[key: string]: string} = {
	'instagram.com': 'www.instagram.com',
	'facebook.com': 'www.facebook.com',
	'm.facebook.com': 'www.facebook.com',
	'www.twitter.com': 'twitter.com',
	'mobile.twitter.com': 'twitter.com',
}

const secureDomains: string[] = ['example.com', 'google.com', 'twitter.com', 'facebook.com', 'instagram.com', 'tiktok.com', 'youtube.com', 'linkedin.com', 'whatsapp.com', 'tumblr.com']
//todo use HSTS https://www.chromium.org/hsts/
//https://raw.githubusercontent.com/chromium/chromium/main/net/http/transport_security_state_static.json

const languageParams = ['locale', 'language', 'lang', 'Lang', 'hl']
const trackingParams = [
	'_ga',
	'fbclid',	// from Meta
	'ref',
	'ref_src',
	'ref_url',
	'referer',
	'ref_',
	'fref',
	'pnref',
	'originalSubdomain',	// from LinkedIn
	'original_referer',
	'share_app_id',
	'share_author_id',
	'share_link_id',
	'share_id',	// from Snapchat
	'sid',	// from Snapchat
	'utm_campaign',
	'utm_content',
	'utm_medium',
	'utm_source',
	'usp',
	'trk',
]
const domainParams: { [key: string]: string[] } = {
	'instagram.com': ['igshid'],
	'twitter.com': ['s', 't'],
	'tiktok.com': ['_d', '_r', '_t', 'checksum', 'sec_uid', 'sec_user_id', 'tt_from', 'u_code', 'user_id'],
}

const ensureURL = (url: URL | string): URL => {
	if (typeof url === 'string') {
		try {
			url = new URL(url)
		} catch (error) {
			if (getDomain(url)) {
				url = new URL(`http://${url}`)
			} else {
				throw new Error('Invalid URL')
			}
		}
	}

	return url
}

const sanitizeUrl = (url: URL | string, options?: SanitizeUrlOptions): string => {
	const opts = {
		allowedProtocols: ['http:', 'https:'],
		...options,
	}
	const toURL = ensureURL(url)

	if (!opts.allowedProtocols.includes(toURL.protocol)) {
		throw new Error(`Invalid URL protocol "${toURL.protocol}"`)
	}

	// validate domain
	const parsedDomain = parse(toURL.hostname)

	if (!parsedDomain.domain || !parsedDomain.isIcann) {
		throw new Error(`Not a valid internet domain "${toURL.hostname}"`)
	}

	// update hostname typos
	if (hostnameRewrites[toURL.hostname]) {
		toURL.hostname = hostnameRewrites[toURL.hostname]
	}

	// remove common prefixes (www., mobile.) for easier parsing
	let cleanHostname = toURL.hostname.replace(/^(www\.)/, '').replace(/^(mobile\.)/, '').replace(/^(m\.)/, '')

	// upgrade domain protocol
	if (toURL.protocol === 'http:' && secureDomains.includes(cleanHostname)) {
		toURL.protocol = 'https:'
	}

	// remove tracking && language params
	[...trackingParams, ...languageParams].forEach(param => {
		toURL.searchParams.delete(param)
	})

	// remove domain-specific params
	if (cleanHostname in domainParams) {
		domainParams[cleanHostname].forEach(param => {
			toURL.searchParams.delete(param)
		})
	}

	return toURL.toString()
}

const urlInfo = (url: URL | string): any => {
	const sanitized = sanitizeUrl(url)
	const originalUrl = url
	url = new URL(sanitized)

	// validate domain
	const parsedDomain = parse(url.hostname)

	// remove common prefixes (www., mobile.) for easier parsing
	let noWwwHostname = url.hostname.replace(/^(www\.)/, '').replace(/^(mobile\.)/, '').replace(/^(m\.)/, '')

	return {
		originalUrl,
		url: sanitized,
		hostname: url.hostname,
		domain: parsedDomain.domain,
		subdomain: parsedDomain.subdomain,
		group: '',
		handle: null,
		providerId: null,
	}
}

module.exports = {
	sanitizeUrl,
	urlInfo,
}
