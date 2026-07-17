import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from '../config.js';
import fs from 'fs';

// Check if credentials file exists
if (!fs.existsSync(config.GOOGLE_APPLICATION_CREDENTIALS)) {
    console.error(`Firebase Service Account File not found at ${config.GOOGLE_APPLICATION_CREDENTIALS}!`);
    console.error("Please place the service-account.json file in the project directory.");
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(config.GOOGLE_APPLICATION_CREDENTIALS, 'utf-8'));

try {
    initializeApp({
        credential: cert(serviceAccount)
    });
} catch(err: any) {
    console.error("Failed to initialize Firebase:", err.message);
    process.exit(1);
}

const db = getFirestore();

export async function addMemory(userId: number | string, role: string, content: string) {
    const docRef = db.collection('users').doc(userId.toString()).collection('messages').doc();
    await docRef.set({
        role,
        content,
        timestamp: new Date()
    });
}

export async function getMemory(userId: number | string, limit = 15): Promise<{role: 'user' | 'assistant' | 'system', content: string}[]> {
    const memRef = db.collection('users').doc(userId.toString()).collection('messages')
        .orderBy('timestamp', 'desc')
        .limit(limit);
    
    const snapshot = await memRef.get();
    const rows: {role: 'user' | 'assistant' | 'system', content: string}[] = [];
    
    snapshot.forEach(doc => {
        const data = doc.data();
        rows.push({
            role: data.role as any,
            content: data.content
        });
    });
    
    return rows.reverse();
}
