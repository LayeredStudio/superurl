import { strict as assert } from 'node:assert'
import test from 'node:test'

import { getYouTubeVideoId } from '../src/index.ts'

test('getYoutubeVideoId() - invalid args', function () {
	assert.throws(() => getYouTubeVideoId('invalid-url'), Error);
	assert.throws(() => getYouTubeVideoId('http://google.com'), Error);
	assert.throws(() => getYouTubeVideoId('http://youtube.com'), Error);
	assert.throws(() => getYouTubeVideoId('https://www.youtube.com/watch?v=fake'), Error);
})

test('getYoutubeVideoId() - get video ID', function () {
	assert.equal(getYouTubeVideoId('https://www.youtube.com/watch?v=nTeia0mgz5Y'), 'nTeia0mgz5Y');
	assert.equal(getYouTubeVideoId('https://m.youtube.com/watch?v=nTeia0mgz5Y'), 'nTeia0mgz5Y');
	assert.equal(getYouTubeVideoId('https://gaming.youtube.com/watch?v=nTeia0mgz5Y'), 'nTeia0mgz5Y');
	assert.equal(getYouTubeVideoId('https://music.youtube.com/watch?v=nTeia0mgz5Y'), 'nTeia0mgz5Y');
	assert.equal(getYouTubeVideoId('https://youtu.be/nTeia0mgz5Y?si=Og7QukHZYo0LBTmm'), 'nTeia0mgz5Y', 'Invalid YouTube short url');
	assert.equal(getYouTubeVideoId('https://www.youtube.com/v/nTeia0mgz5Y?cbrd=1'), 'nTeia0mgz5Y');
	assert.equal(getYouTubeVideoId('https://www.youtube.com/embed/nTeia0mgz5Y'), 'nTeia0mgz5Y');
	assert.equal(getYouTubeVideoId('https://www.youtube-nocookie.com/embed/nTeia0mgz5Y'), 'nTeia0mgz5Y');
	assert.equal(getYouTubeVideoId('https://www.youtube.com/live/nTeia0mgz5Y'), 'nTeia0mgz5Y');
})
