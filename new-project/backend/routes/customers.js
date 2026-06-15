const router = require('express').Router();
const { getAll, create, update, remove } = require('../controllers/customerController');
const { auth, adminOnly } = require('../middleware/auth');
router.get('/', auth, getAll);
router.post('/', auth, create);
router.put('/:id', auth, update);
router.delete('/:id', auth, adminOnly, remove);
module.exports = router;
