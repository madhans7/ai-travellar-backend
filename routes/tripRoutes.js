const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const tripController = require('../controllers/tripController');

router.use(auth);

router.post('/', tripController.createTrip);
router.get('/', tripController.getUserTrips);
router.get('/:id', tripController.getTripById);
router.delete('/:id', tripController.deleteTrip);

router.post('/generate', tripController.generateTrip);

router.post('/:id/activity', tripController.addActivity);
router.delete('/:id/activity', tripController.deleteActivity);
router.post('/:id/regenerate', tripController.regenerateDay);

module.exports = router;
