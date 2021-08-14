// import module `express`
const express = require('express');

const router = express.Router();

// import module `controller` from `../controllers/controller.js`
const controller = require('../controllers/controller.js');

const viewInventoryController = require('../controllers/viewInventoryController.js');

const addNewDishController = require('../controllers/addNewDishController.js');

const purchaseController = require('../controllers/purchaseController.js');

const menuController = require('../controllers/menuController.js');

const orderHistoryController = require('../controllers/orderHistoryController.js');

router.get('/favicon.ico', controller.getFavicon);

router.get('/', controller.getIndex);

router.get('/dashboard', controller.getDashboard);

router.get('/inventory', viewInventoryController.getInventory);

router.post('/addIngredient', viewInventoryController.addIngredient);

router.get('/ingredient/:systemID', viewInventoryController.getIngredient);

router.get('/getCheckStockName', viewInventoryController.getCheckStockName);

router.post('/addStock', viewInventoryController.addStock);

router.get('/addNewDish', addNewDishController.getAddNewDish);

router.get('/getCheckDishName', addNewDishController.getCheckDishName);

router.get('/getIngredientID', addNewDishController.getIngredientID);

router.get('/getIngredientName', addNewDishController.getIngredientName);

router.get('/getCheckIngredientName', addNewDishController.getCheckIngredientName);

router.get('/getAutoIngredientName', addNewDishController.getAutoIngredientName);

router.get('/postAddDish', addNewDishController.postAddDish);

router.post('/postAddIngredients', addNewDishController.postAddIngredients);

router.post('/postAddOneIngredient', addNewDishController.postAddOneIngredient); 

router.get('/newPurchase', purchaseController.renderPurchase);

router.get('/getStockName?', purchaseController.getStockName);

router.get('/getStockInfo', purchaseController.getStockInfo);

router.post('/savePurchase', purchaseController.addPurchase);

router.get('/viewPurchases', purchaseController.getViewPurchases);

router.get('/purchase/:systemID', purchaseController.viewSpecificPurchase);

router.get('/getSearchPurchase', purchaseController.getSearchPurchase);

router.get('/getFilteredRows', purchaseController.getFilteredRows);

router.get('/menu', menuController.getMenu);

router.get('/getFilteredRows', purchaseController.getFilteredRows);

router.get('/orderHistory', orderHistoryController.getOrderHistory);

module.exports = router;