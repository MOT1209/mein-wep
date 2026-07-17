const express = require('express');
const router = express.Router();
const azkarController = require('../controllers/azkarController');

router.get('/categories', azkarController.getAllCategories);
router.get('/:category', azkarController.getAzkarByCategory);

module.exports = router;
