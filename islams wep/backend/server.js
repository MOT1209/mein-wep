const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow requests from our frontend
app.use(express.json());

// مسار تجريبي للتأكد من عمل السيرفر
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Islamic Website API!', status: 'running' });
});

// استيراد المسارات (Routes)
const azkarRoutes = require('./routes/azkar');
const articleRoutes = require('./routes/articles');
const quranRoutes = require('./routes/quran');
const hadithsRoutes = require('./routes/hadiths');

// استخدام المسارات
app.use('/api/azkar', azkarRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/quran', quranRoutes);
app.use('/api/hadiths', hadithsRoutes);

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
