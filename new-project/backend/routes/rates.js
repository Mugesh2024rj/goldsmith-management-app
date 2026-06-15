const router = require('express').Router();
const { getRates, updateRates } = require('../controllers/rateController');
const { auth, adminOnly } = require('../middleware/auth');
router.get('/', auth, getRates);
router.put('/', auth, adminOnly, updateRates);
module.exports = router;
