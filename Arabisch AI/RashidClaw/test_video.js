const axios = require('axios');
const fs = require('fs');

async function testVideo() {
    console.log("Testing Pollinations Video API...");
    try {
        const response = await axios.get('https://image.pollinations.ai/prompt/cat?model=video', {
            responseType: 'arraybuffer'
        });
        const type = response.headers['content-type'];
        console.log("Content-Type:", type);
        fs.writeFileSync('test_video.bin', response.data);
        console.log("Saved as test_video.bin, size:", response.data.length);
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testVideo();
