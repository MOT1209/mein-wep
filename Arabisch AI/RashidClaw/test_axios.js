const axios = require('axios');
async function test() {
    try {
        const url = `https://image.pollinations.ai/prompt/test?width=1024&height=1024&nologo=true`;
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
        console.log("Type:", Buffer.isBuffer(response.data), "Len:", response.data.length);
    } catch (e) {
        console.log("Error:", e.message);
    }
}
test();
