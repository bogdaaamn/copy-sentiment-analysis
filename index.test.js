const index = require('./index');
const dotenv = require('dotenv').config();

describe('getFiles', () => {
  test('throws no files found', async () => {
    await expect(index.getFiles(['foo'])).rejects.toThrow('No files matching the pattern found. :(');
  });

  test('gets HTML files', async () => {
    await expect(Array.isArray(await index.getFiles(['public/**/*.html']))).toBe(true);
  });
});

describe('getText', () => {
  test('throws no file found', async () => {
    await expect(index.getText('whatever/doesnt/exist.html')).rejects.toThrow('ENOENT: no such file or directory, open \'whatever/doesnt/exist.html\'');
  });

  test('gets empty string from empty file', async () => {
    await expect(await index.getText('public/pizza/empty.html')).toEqual('');
  });

  test('gets pizza text from file', async () => {
    await expect(await index.getText('public/pizza/yay-pizza.html')).toEqual('Pizza was the best thing that happened in my life');
  });
});

describe('getSentiment', () => {
  // test('throws wrong API key', async () => {
  //   await expect(await index.getSentiment('bullshit', 'Pizza was the best thing that happened in my life'))
  //     .toThrow('Wrong API key!');
  // });

  test('get positive sentiment', async () => {
    const sentiment = await index.getSentiment(process.env.key, 'Pizza was the best thing that happened in my life')
    await expect(sentiment.documentSentiment.score).toBeGreaterThan(0.5);
  });

  test('get neutral sentiment', async () => {
    const sentiment = await index.getSentiment(process.env.key, 'Low-key liking pizza over here')
    await expect(sentiment.documentSentiment.score).toBeCloseTo(0);
  });

  test('get negative sentiment', async () => {
    const sentiment = await index.getSentiment(process.env.key, 'But I swear I absolutely hate the pineapple on it!')
    await expect(sentiment.documentSentiment.score).toBeLessThan(-0.5);
  });
});
