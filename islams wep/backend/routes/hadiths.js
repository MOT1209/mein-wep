const express = require('express');
const router = express.Router();
const hadithController = require('../controllers/hadithController');

router.get('/categories', hadithController.getAllCategories);
router.get('/books', hadithController.getAllBooks);
router.get('/category/:category', hadithController.getHadithsByCategory);

module.exports = router;
