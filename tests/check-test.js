/****************
 * IMPORTS
 */

var async = require('async')
var redis = require('redis')
var Gardien = require('../main')

/****************
 * PRIVATE FUNCTIONS
 */

/****************
 * PUBLIC FUNCTIONS
 */

//var driver = new g.drivers.MemoryDriver()

var driver = new Gardien.drivers.RedisDriver({
	prefix: 'gardien',
	separator: ':',
	index: 0,
	options: {}
})

var seraphin = new Gardien.Seraphin( driver, {
	debug: true
})

var cherubin = new Gardien.Cherubin( {
	debug: true
})

var userId = 'oothkoo'

async.series(
	[
		function (cb) {
			seraphin.init(function (err) {
				cb(null)
			})
		},
		function (cb) {
			seraphin.getAllUserRules(userId, function (rules) {
				cherubin.updateRules( rules )
				console.log('rules', rules)
				cb(null)
			})
		}
	],
	function (err, results) {
		console.log('allowed: ' + cherubin.isAllowed( ['*'], ['*'], ['oothkoo-stgzd'], ['view', 'edit', 'like', 'create'] ) )
	}
)
