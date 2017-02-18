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

async.series(
	[
		function (cb) {
			seraphin.init(function (err) {
				cb(null)
			})
		},
		function (cb) {

			var roles = [
			    {
			        name: 'guest',
			        permissions: [
			            'view'
			        ]
			    },
			    {
			        name: 'member',
			        inherits: 'guest',
			        permissions: [
			            'create',
			            'edit',
			            'like'
			        ]
			    },
			    {
			        name: 'lead',
			        inherits: 'member',
			        permissions: [
			            'delete'
			        ]
			    },
			    {
			        name: 'owner',
			        inherits: 'lead',
			        permissions: [
			            'import',
			            'fork',
			            'merge'
			        ]
			    },
			    {
			        name: 'team',
			        permissions: [
			            'invite',
			            'create'
			        ]
			    }
			]

			seraphin.setRoles(roles, function (err) {
				cb(null)
			})
		},
		function (cb) {
			seraphin.createUser( 'oothkoo', ['member','team'], function (err) {
				cb(null)
			})
		},
		function (cb) {
			seraphin.createUser( 'mario', ['owner'], function (err) {
				cb(null)
			})
		},
		function (cb) {
			seraphin.allowRole( 'guest', ['*'], function (err) {
				cb(null)
			})
		},
		function (cb) {
			seraphin.allowRole('member', ['*'], function (err) {
				cb(null)
			})	
		},
		function (cb) {
			seraphin.allowRole('lead', ['*'], function (err) {
				cb(null)
			})	
		},
		function (cb) {
			seraphin.allowRole('owner', ['*'], function (err) {
				cb(null)
			})
		},
		function (cb) {
			seraphin.allowRole('team', ['library'], function (err) {
				cb(null)
			})
		},
		function (cb) {
			seraphin.allowUser('oothkoo', ['*'], ['delete'], function (err) {
				cb(null)
			})
		},/*
		function (cb) {
			gardien.removeRoleByName('member', function (err) {
				cb(null)
			})
		},
		function (cb) {
			gardien.removeUserById('mario', function (err) {
				cb(null)
			})
		},*/
		function (cb) {
			seraphin.showRoles(function (err) {
				cb(null)
			})
		},
		function (cb) {
			seraphin.showRules(function (err) {
				cb(null)
			})
		},
		function (cb) {
			seraphin.showUsers(function (err) {
				cb(null)
			})
		}
	],
	function (err, results) {
		console.log()	
	    console.log('done.')
	}
)
