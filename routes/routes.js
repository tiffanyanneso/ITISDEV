// import module `express`
const express = require('express');

const router = express.Router();

// import module `controller` from `../controllers/controller.js`
const controller = require('../controllers/controller.js');

const viewInventoryController = require('../controllers/viewInventoryController.js');

const addNewDishController = require('../controllers/addNewDishController.js');

const purchasesController = require('../controllers/purchasesController.js');

router.get('/favicon.ico', controller.getFavicon);

router.get('/', controller.getIndex);

router.get('/dashboard', controller.getDashboard);

router.get('/inventory', viewInventoryController.getInventory);

router.post('/addIngredient', viewInventoryController.addIngredient);

router.get('/ingredient/:systemID', viewInventoryController.getIngredient);

router.post('/addStock', viewInventoryController.addStock);

router.get('/addNewDish', addNewDishController.getAddNewDish);

router.get('/getCheckDishID', addNewDishController.getCheckDishID);

router.get('/getIngredientID', addNewDishController.getIngredientID);

router.get('/getIngredientName', addNewDishController.getIngredientName);

router.post('/postAddDish', addNewDishController.postAddDish);

router.post('/postAddIngredients', addNewDishController.postAddIngredients);

router.get('/viewPurchases', purchasesController.getViewPurchases);



module.exports = router;