const { TikTokBot } = require('./bot');

async function testV() {
    const handles = ['al---------48', 'al_________48'];
    for (const h of handles) {
        console.log(`\nTesting @${h}...`);
        const bot = new TikTokBot(0, h, null);
        try {
            const start = Date.now();
            await bot.init(false);
            const stats = await bot.getProfileData();
            const end = Date.now();
            console.log(`Result for @${h}:`, stats ? 'FOUND' : 'NOT FOUND');
            if (stats) console.log('Stats:', stats);
            console.log(`Time taken: ${(end - start) / 1000}s`);
            await bot.stop();
        } catch (e) {
            console.error(`Failed for @${h}:`, e.message);
            if (bot) await bot.stop();
        }
    }
}

testV();
