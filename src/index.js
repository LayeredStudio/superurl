import { parse as parseDomain } from 'tldts'

const hostnameRewrites = {
	'instagram.com': 'www.instagram.com',
	'facebook.com': 'www.facebook.com',
	'm.facebook.com': 'www.facebook.com',
	'www.twitter.com': 'twitter.com',
	'mobile.twitter.com': 'twitter.com',
}

const secureDomains = ['example.com', 'google.com', 'twitter.com', 'facebook.com', 'instagram.com', 'tiktok.com', 'youtube.com', 'linkedin.com', 'whatsapp.com', 'tumblr.com']
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
	'utm_name',
	'usp',
	'trk',
	'si',	// from Spotify
	'nd',	// from Spotify
]
const domainParams = {
	'instagram.com': ['igshid'],
	'twitter.com': ['s', 't'],
	'tiktok.com': ['_d', '_r', '_s', '_t', 'checksum', 'sec_uid', 'sec_user_id', 'tt_from', 'u_code', 'user_id'],
}

const handleRegexByHostname = {
	'github.com': /^[a-z0-9-]{2,}$/i,
	'instagram.com': /^([\w\.]){2,30}$/,
	'pinterest.com': /^[a-z0-9_]{1,15}$/i,
	'tiktok.com': /^@?[a-z0-9_\.]{2,30}$/i,
	'twitter.com': /^@?(\w){1,15}$/,
	'youtube.com': /^@?([\w\.-]){3,30}$/,
}

const ensureURL = (url) => {
	if (typeof url === 'string') {
		if (URL.canParse(url)) {
			url = new URL(url)
		} else if (URL.canParse(`http://${url}`)) {
			url = new URL(`http://${url}`)
		}
	}

	if (!(url instanceof URL)) {
		throw new Error('Invalid URL')
	}

	return url
}

const sanitizeUrl = (url, options) => {
	const opts = {
		allowedProtocols: ['http:', 'https:'],
		...options,
	}
	const toURL = ensureURL(url)

	if (!opts.allowedProtocols.includes(toURL.protocol)) {
		throw new Error(`Invalid URL protocol "${toURL.protocol}"`)
	}

	// validate domain
	const parsedDomain = parseDomain(toURL.hostname)

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

const urlInfo = (url) => {
	const originalUrl = url
	const sanitized = sanitizeUrl(url)
	url = new URL(sanitized)

	let handle = null
	let providerId = null

	// validate domain
	const parsedDomain = parseDomain(url.hostname)

	// remove common prefixes (www., mobile.) for easier parsing
	let cleanHostname = url.hostname.replace(/^(www\.)/, '').replace(/^(mobile\.)/, '').replace(/^(m\.)/, '')

	// individual paths
	const paths = url.pathname.split('/').filter(Boolean)

	if (paths.length) {

		// handle as first url path
		if (Object.keys(handleRegexByHostname).includes(parsedDomain.domain)) {
			const pathHandle = paths[0].startsWith('@') ? paths[0].slice(1) : paths[0]

			if (handleRegexByHostname[parsedDomain.domain].test(pathHandle)) {
				handle = pathHandle
			}
		} else if (parsedDomain.domain === 'linkedin.com' && paths.length > 1 && paths[0] === 'in') {
			handle = paths[1]
		} else if (parsedDomain.domain === 'facebook.com') {
			if (paths[0] === 'profile.php') {
				providerId = url.searchParams.get('id')
			} else if (paths[0] === 'pages' && paths[1]) {
				handle = paths[1]
			} else {
				handle = paths[0]
			}

			if (handle && /^[a-z0-9.]+$/i.test(handle)) {
			} else {
				handle = null
			}
		}
	}

	return {
		originalUrl,
		url: sanitized,
		hostname: url.hostname,
		domain: parsedDomain.domain,
		subdomain: parsedDomain.subdomain,
		handle,
		providerId,
	}
}

export {
	sanitizeUrl,
	urlInfo,
}
