import fs from 'fs';

async function testFetch() {
    console.log("Testing fetch on Pollinations...");
    try {
        const url = "https://image.pollinations.ai/prompt/Design%20a%20flying%20car%20in%203D?width=1024&height=1024&seed=12345&nologo=true";
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });
        
        console.log("Status:", response.status);
        console.log("Content-Type:", response.headers.get('content-type'));
        
        const buffer = await response.arrayBuffer();
        console.log("Size:", buffer.byteLength);
        
        if (response.status === 200 && buffer.byteLength > 1000) {
            console.log("✅ SUCCESS!");
        } else {
            console.log("❌ FAILED");
        }
    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

testFetch();
