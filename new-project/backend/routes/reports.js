const router = require('express').Router();
const { daily, weekly, monthly, yearly } = require('../controllers/reportController');
const { auth } = require('../middleware/auth');
router.get('/daily', auth, daily);
router.get('/weekly', auth, weekly);
router.get('/monthly', auth, monthly);
router.get('/yearly', auth, yearly);
module.exports = router;
