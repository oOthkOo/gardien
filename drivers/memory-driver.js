/****************
 * IMPORTS
 */

var util = require('util')
var async = require('async')
var _ = require('lodash')
var Driver = require('./driver')

/****************
 * PRIVATE FUNCTIONS
 */

/****************
 * PUBLIC FUNCTIONS
 */

function MemoryDriver () {
	
}

util.inherits( MemoryDriver, Driver )

MemoryDriver.prototype.init = function (callback) {
	this.users = []
    this.roles = []
    this.rules = {}
    this.callCallback(callback, null)
}

MemoryDriver.prototype.createUser = function (userId, roles, callback) {
    this.users.push({
        id: userId,
        roles: roles
    })
    this.callCallback(callback, null)
}

MemoryDriver.prototype.getUsers = function (callback) {
    this.callCallback(callback, this.users)
}

MemoryDriver.prototype.getUserById = function (userId, callback) {
	for (var u=0; u<this.users.length; u++) {
        var user = this.users[u]
        if (user.id == userId) {
            this.callCallback(callback, user)
            return
        }
   }
   this.callCallback(callback, null)
}

MemoryDriver.prototype.createRole = function (role, callback) {
    this.roles.push( role )
    this.callCallback(callback, null)
}

MemoryDriver.prototype.removeRoleByName = function (name, callback) {
    var index = this.getRoleIndexByName(name)
    if (index > -1) {
    	this.roles.splice(index, 1)
    }
    this.callCallback(callback, null)
}

MemoryDriver.prototype.removeAllRoles = function (callback) {
	this.roles = []
    this.callCallback(callback, null)
}

MemoryDriver.prototype.setRoles = function (roles, callback) {
    this.roles = roles
    this.callCallback(callback, null)
}

MemoryDriver.prototype.getRoles = function (callback) {
	this.callCallback(callback, this.roles)
}

MemoryDriver.prototype.getRoleByName = function (name, callback) {
   	this.getRoleIndexByName(name, function (index) {
   		if (index < 0) {
   			this.callCallback(callback, null)
   			return
   		}
   		this.callCallback(callback, this.roles[index])

   	}.bind(this)) 
}

MemoryDriver.prototype.getRoleIndexByName = function (name, callback) {
    for (var r=0; r<this.roles.length; r++) {
        var role = this.roles[r]
        if (role.name == name) {
        	this.callCallback(callback, r)
            return
        }
   	}
   	this.callCallback(callback, -1)
}

MemoryDriver.prototype.getRolePermissions = function (name, callback) {
    this.getRoleByName(name, function (uRole) {
    	if (!uRole) {
    		this.callCallback(callback, [])
	        return 
	    }

	    var permissions = uRole.permissions || []
	    if (uRole.inherits) {
	        var roles = uRole.inherits.split(' ')

	        async.eachSeries(roles, function (role, cb) {

	        		this.getRolePermissions( roles, function (result) {

	        			if (!result) {
	        				cb(null)
	        				return
	        			}

	        			permissions = permissions.concat( result )
	        			cb(null)
	        		})
					
				}.bind(this),
				function done () {
					this.callCallback(callback, _.uniq( permissions ))
				}.bind(this)
			)
	    }
	    else {
	    	this.callCallback(callback, _.uniq( permissions ))
	    }

    }.bind(this))
}

MemoryDriver.prototype.getInheritRoleNames = function (name, callback) {
	this.getRoleByName(name, function (role) {
    	if (!role) {
    		this.callCallback(callback, [])
	        return 
	    }
	    var names = [name]
	    if (role.inherits) {
	        var inherits = role.inherits.split(' ')

	        async.eachSeries(inherits, function (inherit, cb) {

	        		this.getInheritRoleNames( inherit, function (result) {

	        			if (!result) {
	        				cb(null)
	        				return
	        			}

	        			names = names.concat( result )
	        			cb(null)
	        		})
					
				}.bind(this),
				function done () {
					this.callCallback(callback, _.uniq( names ))
				}.bind(this)
			)
	    }
	    else {
	    	this.callCallback(callback, names)
	    }

	}.bind(this))
}

MemoryDriver.prototype.getUserRoles = function (user, callback) {

	var roles = []
	var names = []

	async.series(
		[
			function (cb) {

				async.eachSeries(user.roles, function (role, cb2) {

						this.getInheritRoleNames( role, function (result) {

							names = names.concat( result )
							cb2(null)
						})
						
					}.bind(this),
					function done () {
						cb(null)
					}.bind(this)
				)

			}.bind(this),
			function (cb) {

				names = _.uniq( names )

				async.eachSeries(names, function (name, cb2) {

						this.getRoleByName(name, function (role) {

							roles.push( role )
							cb2(null)
						})

					}.bind(this),
					function done () {
						cb(null)
					}.bind(this)
				)

			}.bind(this)
		],
		function (err, results) {
			this.callCallback(callback, roles)
		}.bind(this)
	)
}

MemoryDriver.prototype.createRule = function (rule, callback) {
    this.rules[rule] = 1
    this.callCallback(callback, null)
}

MemoryDriver.prototype.createRoleRule = function (role, rule, callback) {
    this.createRule(rule, callback)
}

MemoryDriver.prototype.createUserRule = function (userId, rule, callback) {
    this.createRule(rule, callback)
}

MemoryDriver.prototype.removeRule = function (rule, callback) {
    delete this.rules[rule]
    this.callCallback(callback, null)
}

MemoryDriver.prototype.removeAllRules = function (callback) {
	this.rules = {}
    this.callCallback(callback, null)
}

MemoryDriver.prototype.setRules = function (rules, callback) {
    this.rules = rules
    this.callCallback(callback, null)
}

MemoryDriver.prototype.isRuleExists = function (rule, callback) {
	this.callCallback(callback, typeof this.rules[rule] !== 'undefined')
}

MemoryDriver.prototype.getRules = function (callback) {
	var r = []
	for (var name in this.rules) {
		if (this.rules.hasOwnProperty(name)) {
			r.push(name)
		}
	}
    this.callCallback(callback, r)
}

module.exports = MemoryDriver
