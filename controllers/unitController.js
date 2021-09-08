
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Units = require('../models/UnitsModel.js');

const Conversion = require('../models/ConversionModel.js');

const unitController = {
	getUnitConverter: function (req, res) {

		function getUnitName(unitId) {
			return new Promise ((resolve, reject) => {
				db.findOne (Units, {_id:unitId}, 'unit', function(result){
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

			res.render('unitConversion', {conversions, unitNames});
		}

		db.findMany (Units, {}, '_id unit', function (result) {
			getConversions(result);
		})
		
	},
	

	getCheckUnit: function(req, res) { 

		

        db.findOne(Units, {unit: req.body.unit}, 'id', function(result) {
            
			var unit = {
				unit: req.body.unit
			};

			db.findOne(Units, {unit: unit}, 'unit', function(result) {

				res.send(result);
			});
		
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
				operator: req.body.operator
			};

			var operator1;
			if (conversion.operator == "*")
				operator1 = '/';
			else
				operator1 = '*';

			var conversion1 = {
				unitA: req.body.unitB,
				unitB: req.body.unitA,
				ratio: req.body.ratio,
				operator:operator1
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
		
	}

};

module.exports = unitController;