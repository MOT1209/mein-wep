import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const credPath = './service-account.json';
if (!fs.existsSync(credPath)) {
    console.error("NOT FOUND");
    process.exit(1);
}

try {
    const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
    console.log("JSON OK:", serviceAccount.project_id);
    
    initializeApp({
        credential: cert(serviceAccount)
    });
    const db = getFirestore();
    console.log("FIRESTORE OK");
} catch(err: any) {
    console.error("FAILED:", err.message);
}
