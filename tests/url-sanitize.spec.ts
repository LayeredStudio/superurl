const assert = require('assert')

const { sanitizeUrl } = require('../src/index.ts')

describe('sanitizeUrl()', function () {
	it('no url', function () {
		assert.throws(sanitizeUrl, Error);
	});

	it('invalid url', function () {
		assert.throws(() => sanitizeUrl('invalid-url'), Error);
	});

	it('invalid protocols', function () {
		assert.throws(() => sanitizeUrl('ftp://ftp.host'), Error);
		assert.throws(() => sanitizeUrl('site://site.com'), Error);
		assert.throws(() => sanitizeUrl("javascript:alert('xss')"), Error);
	});

	it('allow ftp protocol', function () {
		assert.equal('ftp://ftp.host/', sanitizeUrl('ftp://ftp.host', { allowedProtocols: ['http:', 'https:', 'ftp:'] }));
	});

	it('invalid tld', function () {
		assert.throws(() => sanitizeUrl('http://domain.invalidtld'), Error);
	});

	it('invalid domain', function () {
		assert.throws(() => sanitizeUrl('http://_-_.com'), Error);
	});

	it('ok example site, https', function () {
		assert.equal('https://example.com/', sanitizeUrl('https://example.com'));
	});

	it('ok example site, http', function () {
		assert.equal('http://example.com/', sanitizeUrl('http://example.com'));
	});

	it('no protocol, append http://', function () {
		assert.equal('https://google.com/', sanitizeUrl('google.com'));
		assert.equal('http://www.example.com/', sanitizeUrl('www.example.com'));
	});

	it('upgrade protocol to https on known secure domains', function () {
		assert.equal('https://www.facebook.com/', sanitizeUrl('http://facebook.com'));
		assert.equal('https://google.com/', sanitizeUrl('http://google.com'));
	});

	it('remove analyticcs/campaigns tracking params', function () {
		assert.equal('https://www.facebook.com/oculus/', sanitizeUrl('https://www.facebook.com/oculus/?ref=bookmarks'));
	});

	it('remove language params', function () {
		assert.equal('https://www.instagram.com/twitter/', sanitizeUrl('https://www.instagram.com/twitter/?hl=en'));
	});

	it('remove Meta (Instagram/Facebook/WhatsApp) tracking params', function () {
		assert.equal('https://www.instagram.com/instagram', sanitizeUrl('https://instagram.com/instagram?igshid=YmMyMTA2M2Y='));
		assert.equal('https://trailrunningacademy.com/', sanitizeUrl('https://trailrunningacademy.com/?fbclid=PAAabHWuo5mUnQXPoQ2CdbUdN_S8nJGA11yv8sdxRb5HfSphG_QYAv1f76MSQ'));
	});

	it('remove Twitter tracking params', function () {
		assert.equal('https://twitter.com/Twitter/status/1601692766257709056', sanitizeUrl('https://twitter.com/Twitter/status/1601692766257709056?s=20&t=lBdttyHtwzrA27bJqu0g0Q'));
		assert.equal('https://twitter.com/Twitter/status/1601692766257709056', sanitizeUrl('https://twitter.com/Twitter/status/1601692766257709056?ref_src=twsrc%5Etfw%7Ctwcamp%5Etweetembed%7Ctwterm%5E1598901113910333440%7Ctwgr%5E61781d6803d9d3ca6533629ca455faeab6f45cd2%7Ctwcon%5Es1_&ref_url=https%3A%2F%2Fdomaininvesting.com%2Fpage%2F2%2F'));
	});

	it('remove TikTok tracking params', function () {
		assert.equal('https://www.tiktok.com/@tiktok', sanitizeUrl('https://www.tiktok.com/@tiktok?_t=8WEXSJjCgJp&_r=1'));
		assert.equal('https://www.tiktok.com/@tiktok', sanitizeUrl('https://www.tiktok.com/@tiktok?_d=secCgwIARCbDRjEFSADKAESPgo8dEq2Wni2E6WvJCanRSEzDDF0Qb3RpJoNdteKw%2FyQFEAOVm9Yeguo6SYmk56ER3KJdz%2FcPjxv3OhCauTjGgA%3D&checksum=6247ea4bffa090bbeafdcd95a1ee71f98b3dec4aa4480a8e4cad6b3479e8048b&language=he&sec_uid=MS4wLjABAAAAMVSsV5si5Q3TE-hoefIkSB4SfGiP7efmbW_sleWrFoQ4aNpdKNTVun1VeiEJvXWz&sec_user_id=MS4wLjABAAAAMVSsV5si5Q3TE-hoefIkSB4SfGiP7efmbW_sleWrFoQ4aNpdKNTVun1VeiEJvXWz&share_app_id=1233&share_author_id=6756995973303993349&share_link_id=BFA12B73-0A6C-4CAC-9A99-B7B5E513FAFF&tt_from=copy&u_code=d97f07a06fdd47&user_id=6756995973303993349&utm_campaign=client_share&utm_medium=ios&utm_source=copy&_r=1'));
	});
});

export {}
