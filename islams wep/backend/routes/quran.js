const express = require('express');
const router = express.Router();
const quranController = require('../controllers/quranController');

router.get('/surahs', quranController.getAllSurahs);
router.get('/surahs/:id', quranController.getSurahAyahs);
router.get('/tafsir/:surah/:ayah', quranController.getSurahAyahTafsir);

module.exports = router;
