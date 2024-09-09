import { strict as assert } from 'node:assert'
import test from 'node:test'

import { urlInfo } from '../src/index.js'

test('urlInfo() - invalid args', function () {
	assert.throws(() => urlInfo(''), Error);
	assert.throws(() => urlInfo('invalid-url'), Error);
});

test('urlInfo() - example domain', function () {
	const info = urlInfo('http://example.com')

	assert.deepEqual(info, {
		originalUrl: 'http://example.com',
		url: 'https://example.com/',
		hostname: 'example.com',
		domain: 'example.com',
		subdomain: '',
		handle: null,
		providerId: null,
	});
});

test('urlInfo() - extract subdomains', function () {
	const info = urlInfo('http://subdomain.example.com')

	assert.deepEqual(info, {
		originalUrl: 'http://subdomain.example.com',
		url: 'http://subdomain.example.com/',
		hostname: 'subdomain.example.com',
		domain: 'example.com',
		subdomain: 'subdomain',
		handle: null,
		providerId: null,
	});
});

test('urlInfo() - extract X/Twitter handle', function () {
	assert.deepEqual(urlInfo('http://mobile.twitter.com/@spacex'), {
		originalUrl: 'http://mobile.twitter.com/@spacex',
		url: 'https://twitter.com/@spacex',
		hostname: 'twitter.com',
		domain: 'twitter.com',
		subdomain: '',
		handle: 'spacex',
		providerId: null,
	});

	assert.deepEqual(urlInfo('https://x.com/AndreiIgna?lang=en'), {
		originalUrl: 'https://x.com/AndreiIgna?lang=en',
		url: 'https://x.com/AndreiIgna',
		hostname: 'x.com',
		domain: 'x.com',
		subdomain: '',
		handle: 'AndreiIgna',
		providerId: null,
	});
});

test('urlInfo() - extract LinkedIn info', function () {
	assert.deepEqual(urlInfo('https://www.linkedin.com/in/bjimenez23/'), {
		originalUrl: 'https://www.linkedin.com/in/bjimenez23/',
		url: 'https://www.linkedin.com/in/bjimenez23/',
		hostname: 'www.linkedin.com',
		domain: 'linkedin.com',
		subdomain: 'www',
		handle: 'bjimenez23',
		providerId: null,
	})

	assert.deepEqual(urlInfo('https://www.linkedin.com/in/yann-lecun/?originalSubdomain=it'), {
		originalUrl: 'https://www.linkedin.com/in/yann-lecun/?originalSubdomain=it',
		url: 'https://www.linkedin.com/in/yann-lecun/',
		hostname: 'www.linkedin.com',
		domain: 'linkedin.com',
		subdomain: 'www',
		handle: 'yann-lecun',
		providerId: null,
	});
});

test('urlInfo() - extract Instagram info', function () {
	assert.deepEqual(urlInfo('https://www.instagram.com/mosseri/?hl=fr&igsh=YmMyMTA2M2Y='), {
		originalUrl: 'https://www.instagram.com/mosseri/?hl=fr&igsh=YmMyMTA2M2Y=',
		url: 'https://www.instagram.com/mosseri/',
		hostname: 'www.instagram.com',
		domain: 'instagram.com',
		subdomain: 'www',
		handle: 'mosseri',
		providerId: null,
	})

	assert.deepEqual(urlInfo('https://www.instagram.com/twinbeans.coffeeshop/'), {
		originalUrl: 'https://www.instagram.com/twinbeans.coffeeshop/',
		url: 'https://www.instagram.com/twinbeans.coffeeshop/',
		hostname: 'www.instagram.com',
		domain: 'instagram.com',
		subdomain: 'www',
		handle: 'twinbeans.coffeeshop',
		providerId: null,
	})
});

test('urlInfo() - extract Facebook info', function() {
	assert.deepEqual(urlInfo('https://www.facebook.com/zuck'), {
		originalUrl: 'https://www.facebook.com/zuck',
		url: 'https://www.facebook.com/zuck',
		hostname: 'www.facebook.com',
		domain: 'facebook.com',
		subdomain: 'www',
		handle: 'zuck',
		providerId: null,
	});

	assert.deepEqual(urlInfo('https://de-de.facebook.com/DerixUS/'), {
		originalUrl: 'https://de-de.facebook.com/DerixUS/',
		url: 'https://de-de.facebook.com/DerixUS/',
		hostname: 'de-de.facebook.com',
		domain: 'facebook.com',
		subdomain: 'de-de',
		handle: 'DerixUS',
		providerId: null,
	});

	assert.deepEqual(urlInfo('https://www.facebook.com/profile.php?id=100000000000001'), {
		originalUrl: 'https://www.facebook.com/profile.php?id=100000000000001',
		url: 'https://www.facebook.com/profile.php?id=100000000000001',
		hostname: 'www.facebook.com',
		domain: 'facebook.com',
		subdomain: 'www',
		handle: null,
		providerId: '100000000000001',
	});
});

test('urlInfo() - extract Pinterest info', function () {
	assert.deepEqual(urlInfo('https://www.pinterest.com/alex/'), {
		originalUrl: 'https://www.pinterest.com/alex/',
		url: 'https://www.pinterest.com/alex/',
		hostname: 'www.pinterest.com',
		domain: 'pinterest.com',
		subdomain: 'www',
		handle: 'alex',
		providerId: null,
	});

	assert.deepEqual(urlInfo('https://in.pinterest.com/qadriayaz222/my-design-work/'), {
		originalUrl: 'https://in.pinterest.com/qadriayaz222/my-design-work/',
		url: 'https://in.pinterest.com/qadriayaz222/my-design-work/',
		hostname: 'in.pinterest.com',
		domain: 'pinterest.com',
		subdomain: 'in',
		handle: 'qadriayaz222',
		providerId: null,
	});
});

test('urlInfo() - extract Github info', function () {
	assert.deepEqual(urlInfo('https://github.com/AndreiIgna'), {
		originalUrl: 'https://github.com/AndreiIgna',
		url: 'https://github.com/AndreiIgna',
		hostname: 'github.com',
		domain: 'github.com',
		subdomain: '',
		handle: 'AndreiIgna',
		providerId: null,
	});
});

test('urlInfo() - extract TikTok info', function () {
	assert.deepEqual(urlInfo('https://www.tiktok.com/@tiktok'), {
		originalUrl: 'https://www.tiktok.com/@tiktok',
		url: 'https://www.tiktok.com/@tiktok',
		hostname: 'www.tiktok.com',
		domain: 'tiktok.com',
		subdomain: 'www',
		handle: 'tiktok',
		providerId: null,
	});
});

test('urlInfo() - extract youtube info', function () {
	assert.deepEqual(urlInfo('https://www.youtube.com/@HowAppsWork'), {
		originalUrl: 'https://www.youtube.com/@HowAppsWork',
		url: 'https://www.youtube.com/@HowAppsWork',
		hostname: 'www.youtube.com',
		domain: 'youtube.com',
		subdomain: 'www',
		handle: 'HowAppsWork',
		providerId: null,
	});

	assert.deepEqual(urlInfo('https://www.youtube.com/dougdemuro'), {
		originalUrl: 'https://www.youtube.com/dougdemuro',
		url: 'https://www.youtube.com/dougdemuro',
		hostname: 'www.youtube.com',
		domain: 'youtube.com',
		subdomain: 'www',
		handle: 'dougdemuro',
		providerId: null,
	});
});
