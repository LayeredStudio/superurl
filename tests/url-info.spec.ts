const assert = require('assert')

const { urlInfo } = require('../src/index.ts')

describe('urlInfo()', function () {
	it('no url', function () {
		assert.throws(urlInfo, Error);
	});

	it('invalid url', function () {
		assert.throws(() => urlInfo('invalid-url'), Error);
	});

	it('example domain', function () {
		const info = urlInfo('http://example.com')

		assert.deepEqual(info, {
			originalUrl: 'http://example.com',
			url: 'https://example.com/',
			hostname: 'example.com',
			domain: 'example.com',
			subdomain: '',
			group: '',
			handle: null,
			providerId: null,
		});
	});

	it('extract subdomains', function () {
		const info = urlInfo('http://subdomain.example.com')

		assert.deepEqual(info, {
			originalUrl: 'http://subdomain.example.com',
			url: 'http://subdomain.example.com/',
			hostname: 'subdomain.example.com',
			domain: 'example.com',
			subdomain: 'subdomain',
			group: '',
			handle: null,
			providerId: null,
		});
	});

	it('extract twitter handle', function () {
		const info = urlInfo('http://mobile.twitter.com/spacex')

		assert.deepEqual(info, {
			originalUrl: 'http://mobile.twitter.com/spacex',
			url: 'https://twitter.com/spacex',
			hostname: 'twitter.com',
			domain: 'twitter.com',
			subdomain: '',
			group: '',
			handle: 'spacex',
			providerId: null,
		});
	});

});

export {}
