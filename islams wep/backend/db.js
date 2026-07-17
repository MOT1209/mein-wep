const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// إعداد عميل Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// اختبار بسيط للتأكد من الاتصال
async function checkConnection() {
    try {
        const { data, error } = await supabase.from('entity_types').select('count', { count: 'exact' });
        if (error) throw error;
        console.log('Successfully connected to Supabase Knowledge Graph!');
    } catch (err) {
        console.warn('Warning: Could not verify Supabase connection. Check your .env file.', err.message);
    }
}

checkConnection();

module.exports = supabase;
