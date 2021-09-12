
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Units = require('../models/UnitsModel.js');

const Conversion = require('../models/ConversionModel.js');

const Ingredients = require('../models/IngredientsModel.js')

const unitController = {
	getUnitConverter: function (req, res) {

		if( req.session.position != 'Admin' && req.session.position != "Inventory" && req.session.position != "Purchasing" ){
			res.redirect('/dashboard');
		}
		else{	

		function getUnitName(unitId) {
			return new Promise ((resolve, reject) => {
				db.findOne (Units, {_id:unitId}, 'unit', function(result){
					console.log("unit")
					console.log(result)
					if (result!="")
						resolve(result.unit);
				})
			})
		}

		function findConversions () {
			return new Promise ((resolve, reject) => {
				db.findMany (Conversion, {}, 'unitA unitB ratio operator', function (result) {
					if (result!="")
						resolve(result);
					else
						reject('')
				})
			})
		}

		async function getConversions (units) {
			try {
				var tempConversions = await findConversions();
			} catch (err) {
				var tempConversions = [];
			}
			
			var conversions = [];

			for (var i=0; i<tempConversions.length; i++) {
				var unitA = tempConversions[i].unitA;
				var unitB = tempConversions[i].unitB;
				
				unitA = await getUnitName(unitA);
				unitB = await getUnitName(unitB);

				var conversion = {
					unitA: unitA,
					unitB: unitB,
					ratio: tempConversions[i].ratio,
					operator: tempConversions[i].operator
				}
				conversions.push(conversion);
			}
			
			var unitNames = [];
			for (var i=0; i<units.length; i++) {
				var unit = {
					id:units[i]._id,
					unitName:units[i].unit
				};
				unitNames.push (unit);
			}

			if(req.session.position == "Inventory"  || req.session.position == "Purchasing"){
                var inventory = req.session.position;
                res.render('unitConversion', {conversions, unitNames, inventory});
            }

            if(req.session.position == "Admin"){
               	var manager = req.session.position;
              	res.render('unitConversion', {conversions, unitNames, manager});
            }
		}

		db.findMany (Units, {}, '_id unit', function (result) {
			getConversions(result);
		})
	
		}
	},
	

	getCheckUnitName: function(req, res) { 
		var unit = req.query.unit;

        db.findOne(Units, {unit: unit}, 'unit', function(result) {
            res.send(result);
        });
    },

	saveUnit: function (req, res){

		db.findOne(Units, {unit: req.body.unit}, '_id', function(result){
	
			var unitName = {
				unit: req.body.unit
			};
		
			db.insertOne(Units, unitName, function(flag){
				if(flag){}
			});
		});
	},



	saveUnitConvert: function (req, res) {

		var conversion = {
				unitA: req.body.unitA,
				unitB: req.body.unitB,
				ratio: req.body.ratio,
				operator: '*'
			};

			var conversion1 = {
				unitA: req.body.unitB,
				unitB: req.body.unitA,
				ratio: req.body.ratio,
				operator: '/'
			};

			//insert conversion from unitA to unitB
			db.insertOne (Conversion, conversion, function (flag){
				if (flag) { }
			});

			//insert conversion from unitB to unitA
			db.insertOne (Conversion, conversion1, function (flag){
				if (flag) { }
			});

		//insertConversion(unitA, unitB, ratio, operator);
		
	},

	checkUnitConverter: function(req, res) {

		var unit = req.query.unit;
		var ingredientName = req.query.ingredientName

		// get ingredient
		function getIngredient(ingredientName) {
			return new Promise ((resolve, reject) => {
				var projection = '_id ingredientName unitMeasurement quantityAvailable';
				db.findOne (Ingredients, {ingredientName: ingredientName}, projection, function(result) {
					if (result!="")
						resolve(result);
				});
			});
		}


		function getConversion (unitA, unitB){
			return new Promise((resolve, reject) => {
				var conversion = []
				db.findOne (Conversion, {$and:[ {unitA:unitA}, {unitB:unitB} ]}, 'ratio operator', function(result){
					//console.log("direct " + result);
					if (result!="") 
						conversion.push (result)
					resolve(conversion);
				})
			})
		}

		function getIndirectConversion(unitA, unitB) {
			return new Promise ((resolve, reject) => {
				var conversions = [];
				//get all conversions with ingredientUnit
				db.findMany (Conversion, {unitA:unitA}, 'unitB ratio operator', function (result) {	
					//get all conversions with dishUnit as unit to be converted to
					db.findMany (Conversion, {unitB:unitB}, 'unitA ratio operator', function (result1) {
						var found = false;
						for (var i=0; i<result.length && !found; i++) {
							for (var j=0; j<result1.length && !found; j++) {
								if (result[i].unitB == result1[j].unitA) {
									conversions.push (result[i]);
									conversions.push (result1[j]);
									found = true;
								}
							}
						}
						//console.log("indirect " + conversions);
						resolve(conversions);
					})
				}) 
			})
		}

		async function checkConversion(unit, ingredientName) {
			var ingredient = getIngredient(ingredientName)

			var conversion = []

			conversion = await getConversion(unit, ingredient.unitMeasurement);

			//no direct conversion was found
			if (conversion.length==0)
				conversion = await getIndirectConversion(unit, ingredient.unitMeasurement)
			res.send(conversion)
		}

		checkConversion(unit, ingredientName)
	}

};

module.exports = unitController;