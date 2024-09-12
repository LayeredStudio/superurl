import { parse as parseDomain } from 'tldts'

const hostnameRewrites: {[key: string]: string} = {
	'instagram.com': 'www.instagram.com',
	'facebook.com': 'www.facebook.com',
	'm.facebook.com': 'www.facebook.com',
	'www.twitter.com': 'twitter.com',
	'mobile.twitter.com': 'twitter.com',
}

const secureDomains: string[] = ['example.com', 'google.com', 'twitter.com', 'facebook.com', 'instagram.com', 'tiktok.com', 'youtube.com', 'linkedin.com', 'whatsapp.com', 'tumblr.com', 'x.com']
//todo use HSTS https://www.chromium.org/hsts/
//https://raw.githubusercontent.com/chromium/chromium/main/net/http/transport_security_state_static.json

const languageParams: string[] = ['locale', 'language', 'lang', 'Lang', 'hl', 'locale.x', 'ui_locales']
const trackingParams: string[] = [
	'.lang',
	'.intl',
	'.partner',
	'.src',
	'_ga',
	'__nsrc__',
	'__snid3__',
	'adgroupid',
	'ceid',
	'cmdf',
	'EXP',
	'fbclid',	// from Meta
	'fp_sid',
	'feature',
	'gclid',
	'gl',
	'gad_source',
	'gbraid',
	'intent',
	'ref',
	'ref_src',
	'ref_url',
	'ref_campaign',
	'ref_source',
	'ref_page',
	'ref_loc',
	'ref_cta',
	'referer',
	'referring_guid',
	'ref_',
	'fref',
	'link_ref',
	'nd',	// from Spotify
	'origin',
	'originalSubdomain',	// from LinkedIn
	'original_referer',
	'pnref',
	'pq-origsite',
	'ppid',
	'pp',
	'pli',
	'share_app_id',
	'share_author_id',
	'share_link_id',
	'share_id',	// from Snapchat
	'share_from',
	'si',	// from Spotify/YouTube
	'sid',	// from Snapchat
	'source',
	'sourcetype',
	'src',
	'utm_campaign',
	'utm_content',
	'utm_medium',
	'utm_source',
	'utm_name',
	'utm_term',
	'utm_id',
	'utm_unptid',
	'unptid',
	'ucbcb',
	'usp',
	'trk',
	'via',
	'xtor',
]
const domainParams: {[key: string]: string[]} = {
	'instagram.com': ['igshid', 'igsh'],
	'twitter.com': ['s', 't'],
	'tiktok.com': ['_d', '_r', '_s', '_t', 'checksum', 'sec_uid', 'sec_user_id', 'tt_from', 'u_code', 'user_id'],
	'x.com': ['s', 't'],
}

const handleRegexByHostname: {[key: string]: RegExp} = {
	'about.me': /^([\w\.-]){2,30}$/,
	'allmylinks.com': /^([\w\.-]){2,30}$/,
	'ask.fm': /^([\w\.-]){2,30}$/,
	'anchor.fm': /^([\w-]){2,30}$/,
	'behance.net': /^[\w-]{2,}$/i,
	'cafecito.app': /^[\w-]{2,}$/i,
	'dribbble.com': /^[\w-]{2,}$/i,
	'deviantart.com': /^[\w-]{2,}$/i,
	'fansly.com': /^[\w-]{2,}$/i,
	'github.com': /^[\w-]{2,}$/i,
	'instagram.com': /^([\w\.]){2,30}$/,
	'intro.co': /^([\w\.-]){2,30}$/,
	'leetcode.com': /^[\w-]{2,}$/i,
	'linktr.ee': /^([\w\.]){2,30}$/,
	'lnk.bio': /^([\w\.]){2,30}$/,
	'medium.com': /^@?(\w){1,32}$/,
	'onlyfans.com': /^([\w\.]){2,30}$/,
	'pinterest.com': /^[a-z0-9_]{1,15}$/i,
	't.me': /^[\w-]{2,}$/i,
	'tiktok.com': /^@?[a-z0-9_\.]{2,30}$/i,
	'twitch.tv': /^(\w){1,30}$/,
	'twitter.com': /^@?(\w){1,16}$/,
	'vsco.co': /^([\w\.-]){3,30}$/,
	'vimeo.com': /^([\w\.-]){3,30}$/,
	'x.com': /^@?(\w){1,16}$/,
	'youtube.com': /^@?([\w\.-]){3,30}$/,
}

const forbiddenHandles = ['channel', 'add', 'handle']

function ensureURL(url: string | URL): URL {
	if (typeof url === 'string') {
		url = url.trim()

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

/** Options for sanitizing URLs. */
export type SanitizeUrlOptions = {
	/** Which URL protocols are allowed. */
	allowedProtocols?: string[]
	/** Remove the hash from the URL. */
	removeHash?: boolean
}

/**
 * Pass in a untrusted/dirty URL and get back a sanitized URL. Without any network requests, the url goes through:
 * - Protocol is upgraded to HTTPS for known secure domains
 * - Hostname is validated & corrected
 * - Common tracking & language params are removed
 * - Domain-specific params are removed
 * - Common typos in hostnames are corrected
 * @param url - URL to validate & sanitize
 * @param options 
 * @returns 
 */
export function sanitizeUrl(url: string | URL, options?: SanitizeUrlOptions): URL {
	const opts = {
		allowedProtocols: ['http:', 'https:'],
		removeHash: true,
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

	if (opts.removeHash) {
		toURL.hash = ''
	}

	// update hostname typos
	if (hostnameRewrites[toURL.hostname]) {
		const rewrittenHostname = hostnameRewrites[toURL.hostname];
		if (rewrittenHostname) {
			toURL.hostname = rewrittenHostname;
		}
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
	if (domainParams[cleanHostname]) {
		domainParams[cleanHostname].forEach(param => {
			toURL.searchParams.delete(param)
		})
	}

	return toURL
}

interface UrlInfo {
	originalUrl: string
	url: string
	hostname: string
	domain: string
	subdomain: string | null
	handle: string | null
	providerId: string | null
}

/**
 * Extract information from a URL, such as the domain, handle, or provider ID (e.g. YouTube channel ID, Twitter handle, and more).
 * @param url - URL to extract info from
 * @returns 
 */
export function urlInfo(url: string | URL): UrlInfo {
	const originalUrl = url
	url = sanitizeUrl(url)

	let handle = null
	let providerId = null

	// validate domain
	const parsedDomain = parseDomain(url.hostname)

	if (!parsedDomain.domain || !parsedDomain.isIcann) {
		throw new Error(`Not a valid internet domain "${url.hostname}"`)
	}

	// remove common prefixes (www., mobile.) for easier parsing
	//let cleanHostname = url.hostname.replace(/^(www\.)/, '').replace(/^(mobile\.)/, '').replace(/^(m\.)/, '')

	// individual paths
	const paths = url.pathname.split('/').filter(Boolean)

	if (['tumblr.com', 'substack.com', 'github.io', 'wordpress.com', 'blogspot.com'].includes(parsedDomain.domain) && parsedDomain.subdomain && parsedDomain.subdomain !== 'www') {
		// detect handles in subdomains
		handle = parsedDomain.subdomain

		if (handle.startsWith('www.')) {
			handle.slice(4)
		}
	} else if (paths.length && paths[0]) {
		// check for `handle` in the first path

		if (parsedDomain.domain === 'youtube.com' && paths.length > 1 && ['c', 'user'].includes(paths[0])) {
			handle = paths[1]
		} else if (parsedDomain.domain === 'youtube.com' && paths.length > 1 && paths[0] === 'channel') {
			providerId = paths[1]
		} else if (Object.keys(handleRegexByHostname).includes(parsedDomain.domain)) {
			const pathHandle = paths[0].startsWith('@') ? paths[0].slice(1) : paths[0]

			if (!forbiddenHandles.includes(pathHandle) && handleRegexByHostname[parsedDomain.domain]?.test(pathHandle)) {
				handle = pathHandle
			}
		} else if (parsedDomain.domain === 'flickr.com' && paths.length > 1 && paths[0] === 'people') {
			handle = paths[1]
		} else if (parsedDomain.domain === 'linkedin.com' && paths.length > 1 && paths[0] === 'in') {
			handle = paths[1]
		} else if (parsedDomain.domain === 'reddit.com' && paths.length > 1 && paths[0] === 'user') {
			handle = paths[1]
		} else if (parsedDomain.domain === 'snapchat.com' && paths.length > 1 && paths[0] === 'add') {
			handle = paths[1]
		} else if (parsedDomain.domain === 'paypal.com' && paths.length > 1 && paths[0] === 'paypalme') {
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
				//
			} else {
				handle = null
			}
		}
	}

	return {
		originalUrl: originalUrl.toString(),
		url: url.toString(),
		hostname: url.hostname,
		domain: parsedDomain.domain,
		subdomain: parsedDomain.subdomain,
		handle: handle || null,
		providerId: providerId || null,
	}
}

const youtubeDomains = new Set([
	'youtu.be',
	'youtube.com',
	'www.youtube.com',
	'm.youtube.com',
	'music.youtube.com',
	'gaming.youtube.com',
	'youtube-nocookie.com',
]);

/**
 * Check if a URL is a YouTube video URL and extract the video ID
 * @param url - URL to check
 * @returns - YouTube video ID
 */
export function getYouTubeVideoId(url: string | URL): string {
	url = ensureURL(url)

	if (!youtubeDomains.has(url.hostname)) {
		throw new Error('Not a YouTube URL')
	}

	const youtubeIdRegex = /^([a-zA-Z0-9_-]{11})$/
	let videoId

	if (['www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'gaming.youtube.com'].includes(url.hostname) && url.pathname === '/watch' && url.searchParams.has('v')) {
		videoId = url.searchParams.get('v')
	} else if (url.hostname === 'youtu.be' && url.pathname.length === 12) {
		videoId = url.pathname.slice(1)
	}

	// validate video ID
	if (videoId && youtubeIdRegex.test(videoId)) {
		return videoId
	}

	throw new Error('Invalid YouTube video ID')
}

/**
 * Check if a URL is a YouTube video URL
 * @param url - URL to check
 * @returns
 */
export function isYouTubeVideoUrl(url: string | URL): boolean {
	try {
		getYouTubeVideoId(url)
		return true
	} catch (e) {
		return false
	}
}

/* 
export function isImageUrl(url: string | URL): boolean {
	try {
		url = new URL(url)
	} catch (e) {
		return false
	}

	const path = url.pathname.toLowerCase()

	return path.endsWith('.jpg') ||
		path.endsWith('.jpeg') ||
		path.endsWith('.png') ||
		path.endsWith('.gif') ||
		path.endsWith('.heic') ||
		path.endsWith('.wepb') ||
		path.endsWith('.svg')
	
}

export function isDocumentUrl(url: string | URL): boolean {
	try {
		url = new URL(url)
	} catch (e) {
		return false
	}

	const path = url.pathname.toLowerCase()

	return  path.endsWith('.pdf') ||
		path.endsWith('.doc') ||
		path.endsWith('.docx') ||
		path.endsWith('.xls') ||
		path.endsWith('.xlsx') ||
		path.endsWith('.csv')
	
}

export function isVideoUrl(url: string | URL): boolean {
	try {
		url = new URL(url)
	} catch (e) {
		return false
	}

	const path = url.pathname.toLowerCase()

	return  path.endsWith('.mp4') || path.endsWith('.mov') || path.endsWith('.m4v')
	
}
 */