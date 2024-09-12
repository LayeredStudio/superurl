import { strict as assert } from 'node:assert'
import test from 'node:test'

import { sanitizeUrl } from '../src/index.ts'

test('sanitizeUrl() - invalid args', function () {
	assert.throws(() => sanitizeUrl('invalid-url'), Error);
	assert.throws(() => sanitizeUrl('ftp://ftp.host'), Error);
	assert.throws(() => sanitizeUrl('site://site.com'), Error);
	assert.throws(() => sanitizeUrl("javascript:alert('xss')"), Error);
	assert.throws(() => sanitizeUrl('http://domain.invalidtld'), Error, 'Invalid TLD');
	assert.throws(() => sanitizeUrl('http://_-_.com'), Error, 'Invalid domain');
})

test('sanitizeUrl() - allow ftp protocol', function () {
	assert.equal(sanitizeUrl('ftp://ftp.host', { allowedProtocols: ['http:', 'https:', 'ftp:'] }).toString(), 'ftp://ftp.host/');
});

test('sanitizeUrl() - ok example site, https', function () {
	assert.equal(sanitizeUrl('https://example.com').toString(), 'https://example.com/');
});

test('sanitizeUrl() - no protocol, append http://', function () {
	assert.equal(sanitizeUrl('google.com').toString(), 'https://google.com/');
	assert.equal(sanitizeUrl('www.example.com').toString(), 'https://www.example.com/');
});

test('sanitizeUrl() - upgrade protocol to https on known secure domains', function () {
	assert.equal(sanitizeUrl('http://facebook.com').toString(), 'https://www.facebook.com/');
	assert.equal(sanitizeUrl('http://google.com').toString(), 'https://google.com/');
});

test('sanitizeUrl() - remove analytics/campaigns/tracking params', function () {
	assert.equal(sanitizeUrl('https://www.facebook.com/oculus/?ref=bookmarks').toString(), 'https://www.facebook.com/oculus/');
	assert.equal(sanitizeUrl('https://www.sorryapp.com/powered-by?utm_medium=statusfooter&utm_source=ea5d5bbc.sorryapp.com').toString(), 'https://www.sorryapp.com/powered-by');
	assert.equal(sanitizeUrl('https://www.going.com/blog/introducing-going?_ga=2.69242896.1293422072.1673460812-1097120473.1673460812').toString(), 'https://www.going.com/blog/introducing-going');
	assert.equal(sanitizeUrl('https://www.snapchat.com/add/nyc?share_id=QzVCQkJDNUUtQzgzNS00NjRCLTlEQzQtNTRDRTNDMTE2QzFD&locale=en_US&sid=7eb444d1a6b94949b5a2215b1ef0d459&utm_medium=social&utm_source=hoobe').toString(), 'https://www.snapchat.com/add/nyc');
	assert.equal(sanitizeUrl('https://open.spotify.com/user/31nc3nalswo2n4zo2x4hcra4w2oe?si=sOPwLS9ITfG135t-NJYuxg&nd=1').toString(), 'https://open.spotify.com/user/31nc3nalswo2n4zo2x4hcra4w2oe');
	assert.equal(sanitizeUrl('https://youtu.be/nTeia0mgz5Y?si=Og7QukHZYo0LBTmm').toString(), 'https://youtu.be/nTeia0mgz5Y');
	assert.equal(sanitizeUrl('https://www.proquest.com/?cbl=60394&pq-origsite=gscholar').toString(), 'https://www.proquest.com/?cbl=60394');
});

test('sanitizeUrl() - remove language params', function () {
	assert.equal(sanitizeUrl('https://www.instagram.com/twitter/?hl=en').toString(), 'https://www.instagram.com/twitter/');
});

test('sanitizeUrl() - remove Meta (Instagram/Facebook/WhatsApp) tracking params', function () {
	assert.equal(sanitizeUrl('https://instagram.com/instagram?igshid=YmMyMTA2M2Y=').toString(), 'https://www.instagram.com/instagram');
	assert.equal(sanitizeUrl('https://trailrunningacademy.com/?fbclid=PAAabHWuo5mUnQXPoQ2CdbUdN_S8nJGA11yv8sdxRb5HfSphG_QYAv1f76MSQ').toString(), 'https://trailrunningacademy.com/');
});

test('sanitizeUrl() - remove Twitter tracking params', function () {
	assert.equal(sanitizeUrl('https://twitter.com/Twitter/status/1601692766257709056?s=20&t=lBdttyHtwzrA27bJqu0g0Q').toString(), 'https://twitter.com/Twitter/status/1601692766257709056');
	assert.equal(sanitizeUrl('https://twitter.com/Twitter/status/1601692766257709056?ref_src=twsrc%5Etfw%7Ctwcamp%5Etweetembed%7Ctwterm%5E1598901113910333440%7Ctwgr%5E61781d6803d9d3ca6533629ca455faeab6f45cd2%7Ctwcon%5Es1_&ref_url=https%3A%2F%2Fdomaininvesting.com%2Fpage%2F2%2F').toString(), 'https://twitter.com/Twitter/status/1601692766257709056');
	assert.equal(sanitizeUrl('https://twitter.com/twitter?s=11&t=2tlSCDpZdGnnGGLxfKXDZA').toString(), 'https://twitter.com/twitter');
});

test('sanitizeUrl() - remove TikTok tracking params', function () {
	assert.equal(sanitizeUrl('https://www.tiktok.com/@tiktok?_t=8WEXSJjCgJp&_r=1').toString(), 'https://www.tiktok.com/@tiktok');
	assert.equal(sanitizeUrl('https://www.tiktok.com/@cheese?_t=8ZjpTKn57iP&_r=1').toString(), 'https://www.tiktok.com/@cheese');
	assert.equal(sanitizeUrl('https://www.tiktok.com/@tiktok?_d=secCgwIARCbDRjEFSADKAESPgo8dEq2Wni2E6WvJCanRSEzDDF0Qb3RpJoNdteKw%2FyQFEAOVm9Yeguo6SYmk56ER3KJdz%2FcPjxv3OhCauTjGgA%3D&checksum=6247ea4bffa090bbeafdcd95a1ee71f98b3dec4aa4480a8e4cad6b3479e8048b&language=he&sec_uid=MS4wLjABAAAAMVSsV5si5Q3TE-hoefIkSB4SfGiP7efmbW_sleWrFoQ4aNpdKNTVun1VeiEJvXWz&sec_user_id=MS4wLjABAAAAMVSsV5si5Q3TE-hoefIkSB4SfGiP7efmbW_sleWrFoQ4aNpdKNTVun1VeiEJvXWz&share_app_id=1233&share_author_id=6756995973303993349&share_link_id=BFA12B73-0A6C-4CAC-9A99-B7B5E513FAFF&tt_from=copy&u_code=d97f07a06fdd47&user_id=6756995973303993349&utm_campaign=client_share&utm_medium=ios&utm_source=copy&_r=1').toString(), 'https://www.tiktok.com/@tiktok');
});
