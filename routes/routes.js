// import module `express`
const express = require('express');

const router = express.Router();

// import module `controller` from `../controllers/controller.js`
const controller = require('../controllers/controller.js');

const viewInventoryController = require('../controllers/viewInventoryController.js');

router.get('/favicon.ico', controller.getFavicon);

router.get('/viewInventory', viewInventoryController.getInventory);

module.exports = router;