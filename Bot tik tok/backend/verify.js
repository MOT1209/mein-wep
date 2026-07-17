const axios = require('axios');
const API_URL = 'http://localhost:8000';

async function testHealth() {
    try {
        const res = await axios.get(`${API_URL}/health`);
        console.log('✅ Backend Health:', res.data.status);
    } catch (e) {
        console.error('❌ Backend is DOWN');
    }
}

async function testAuth() {
    try {
        const email = `test_${Date.now()}@example.com`;
        const pass = 'password123';

        await axios.post(`${API_URL}/auth/register`, { email, password: pass });
        console.log('✅ User Registration OK');

        const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password: pass });
        const token = loginRes.data.access_token;
        console.log('✅ User Login OK, Token received');

        const accsRes = await axios.get(`${API_URL}/accounts`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Accounts Fetch OK, Count:', accsRes.data.length);

    } catch (e) {
        console.error('❌ Auth flow FAILED:', e.response ? e.response.data : e.message);
    }
}

async function run() {
    console.log('--- TikBoost Final Audit ---');
    await testHealth();
    await testAuth();
}

run();
