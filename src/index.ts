const { parse } = require('tldts')

const hostnameRewrites: {[key: string]: string} = {
	'instagram.com': 'www.instagram.com',
	'facebook.com': 'www.facebook.com',
	'm.facebook.com': 'www.facebook.com',
	'www.twitter.com': 'twitter.com',
	'mobile.twitter.com': 'twitter.com',
}

const secureDomains = ['google.com', 'twitter.com', 'facebook.com', 'instagram.com', 'tiktok.com', 'youtube.com', 'linkedin.com', 'whatsapp.com', 'tumblr.com']
//todo use HSTS https://www.chromium.org/hsts/
//https://raw.githubusercontent.com/chromium/chromium/main/net/http/transport_security_state_static.json

const sanitizeUrl = (url: URL | string): string => {
	if (typeof url === 'string') {
		url = new URL(url)
	}

	// validate domain
	const parsedDomain = parse(url.hostname)

	if (!parsedDomain.domain || !parsedDomain.isIcann) {
		throw new Error(`Not a valid internet domain "${url.hostname}"`)
	}

	// update hostname typos
	if (hostnameRewrites[url.hostname]) {
		url.hostname = hostnameRewrites[url.hostname]
	}

	// remove common prefixes (www., mobile.) for easier parsing
	let noWwwHostname = url.hostname.replace(/^(www\.)/, '').replace(/^(mobile\.)/, '').replace(/^(m\.)/, '')

	// upgrade domain protocol
	if (secureDomains.includes(noWwwHostname) && url.protocol === 'http:') {
		url.protocol = 'https:'
	}

	// remove tracking params
	url.searchParams.delete('utm_campaign')
	url.searchParams.delete('utm_content')
	url.searchParams.delete('utm_medium')
	url.searchParams.delete('utm_source')
	url.searchParams.delete('fbclid')
	url.searchParams.delete('igshid')
	url.searchParams.delete('ref')
	url.searchParams.delete('ref_')
	url.searchParams.delete('fref')
	url.searchParams.delete('usp')
	url.searchParams.delete('trk')
	url.searchParams.delete('originalSubdomain')
	url.searchParams.delete('original_referer')

	// remove language params
	url.searchParams.delete('locale')
	url.searchParams.delete('lang')
	url.searchParams.delete('Lang')
	url.searchParams.delete('hl')

	// remove Twitter tracking params
	if (url.hostname === 'twitter.com') {
		url.searchParams.delete('s')
		url.searchParams.delete('t')
	}

	return url.toString()
}

const urlInfo = (url: URL | string): any => {
	const sanitized = sanitizeUrl(url)
	const originalUrl = url
	url = new URL(sanitized)

	return {
		url: url.toString(),
		hostname: url.hostname,
		group: '',
		handle: null,
		providerId: null,
	}
}

module.exports = {
	sanitizeUrl,
	urlInfo,
}
