const assert = require('assert')

const { sanitizeUrl } = require('../src/index.ts')

describe('sanitizeUrl()', function () {
	it('no url', function () {
		assert.throws(sanitizeUrl, Error);
	});

	it('invalid url', function () {
		assert.throws(() => sanitizeUrl('invalid-url'), Error);
	});

	it('invalid tld', function () {
		assert.throws(() => sanitizeUrl('http://domain.invalidtld'), Error);
	});

	it('upgrade protocol to https on known secure domains', function () {
		assert.equal('https://www.facebook.com/', sanitizeUrl('http://facebook.com'));
	});

	it('remove analyticcs/campaigns tracking params', function () {
		assert.equal('https://www.facebook.com/oculus/', sanitizeUrl('https://www.facebook.com/oculus/?ref=bookmarks'));
	});

	it('remove IG/FB tracking params', function () {
		const instagramShareUrl = 'https://instagram.com/instagram?igshid=YmMyMTA2M2Y='
		const instagramShareUrlSanitized = 'https://www.instagram.com/instagram/'

		assert.equal(instagramShareUrlSanitized, sanitizeUrl(instagramShareUrl));
	});

	it('remove Twitter tracking params', function () {
		const twitterShareUrl = 'https://twitter.com/Twitter/status/1601692766257709056?s=20&t=lBdttyHtwzrA27bJqu0g0Q'
		const twitterShareUrlSanitized = 'https://twitter.com/Twitter/status/1601692766257709056'

		assert.equal(twitterShareUrlSanitized, sanitizeUrl(twitterShareUrl));
	});

	it('remove language params', function () {
		assert.equal('https://www.instagram.com/twitter/', sanitizeUrl('https://www.instagram.com/twitter/?hl=en'));
	});
});

export {}
