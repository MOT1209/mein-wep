import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

console.log("TEST STARTING...");

try {
    const client = new Client({
        authStrategy: new LocalAuth({ clientId: 'test' }),
        puppeteer: { 
            headless: true,
            args: ['--no-sandbox']
        }
    });

    client.on('qr', (qr) => {
        console.log('QR CODE RECEIVED!');
        qrcode.generate(qr, { small: true });
    });

    client.initialize().then(() => console.log("INITIALIZED")).catch(e => console.error("INIT ERROR:", e));
} catch (e) {
    console.error("CATCH ERROR:", e);
}
