/****************
 * IMPORTS
 */

var util = require('util')
var async = require('async')
var redis = require('redis')
var _ = require('lodash')
var Driver = require('./driver')

/****************
 * PRIVATE FUNCTIONS
 */

/****************
 * PUBLIC FUNCTIONS
 */

function RedisDriver ( options ) {
	this.options = options
	this.options.separator = options.separator || ':'
	this.users = []
    this.roles = []
}

util.inherits( RedisDriver, Driver )

RedisDriver.prototype.generateClient = function () {
	var client = redis.createClient( this.options.port, this.options.host, this.options.options )
	if (this.options.password) {
		client.auth(this.options.password)
	}
	var index = this.options.index
	if (index &&
		index != '') {
		client.select( index )
	}
	return client
}

RedisDriver.prototype.getKeyName = function ( name ) {
	return this.options.prefix + this.options.separator + name
}

RedisDriver.prototype.init = function (callback) {

	this.getUsers(function (users) {
		this.users = users || []

		this.getRoles(function (roles) {
			this.roles = roles || []

			this.callCallback(callback, null)

		}.bind(this))

	}.bind(this))
}

RedisDriver.prototype.setPrefix = function ( prefix ) {
	this.options.prefix = prefix
}

RedisDriver.prototype.createUser = function (userId, roles, callback) {
	var client = this.generateClient()

	var keyName = this.getKeyName( 'users' )
    client.hset(keyName, userId, JSON.stringify(roles), function (err, value) {
		
		client.quit()

		this.users.push({
			id: userId,
			roles: roles
		})

		this.callCallback(callback, null)

	}.bind(this))
}

RedisDriver.prototype.removeUserById = function (userId, callback) {
	var client = this.generateClient()

    var index = this.getUserIndexById(userId)
    if (index > -1) {
    	this.users.splice(index, 1)
    }

    var keyName = this.getKeyName( 'users' )
	client.hdel(keyName, userId, function (err, value) {
		
		keyName = this.getKeyName( 'rules_user_' + userId )
		client.del(keyName, function (err, value) {

			client.quit()
			this.callCallback(callback, null)

		}.bind(this))

	}.bind(this))
}

RedisDriver.prototype.getUserById = function (userId, callback) {
	this.getUserIndexById(userId, function (index) {
   		if (index < 0) {
   			this.callCallback(callback, null)
   			return
   		}
   		this.callCallback(callback, this.users[index])

   	}.bind(this))
}

RedisDriver.prototype.getUserIndexById = function (userId, callback) {
	for (var u=0; u<this.users.length; u++) {
        var user = this.users[u]
        if (user.id == userId) {
            this.callCallback(callback, u)
            return
        }
   }
   this.callCallback(callback, -1)
}

RedisDriver.prototype.getUsers = function (callback) {
	var client = this.generateClient()

	var keyName = this.getKeyName( 'users' )
	client.hgetall(keyName, function (err, users) {

		client.quit()
		if (err) {
			console.log(err)
			this.callCallback(callback, null)
			return
		}
		if (!users) {
			this.callCallback(callback, null)
			return
		}

		var results = []
		for (var user in users) {
			if (users.hasOwnProperty(user)) {
				results.push({
					id: user,
					roles: JSON.parse(users[user])
				})
			}
		}
		this.callCallback(callback, results)

	}.bind(this))
}

RedisDriver.prototype.createRole = function (role, callback) {
    var client = this.generateClient()

	var keyName = this.getKeyName( 'roles' )

	var data = {}
	if (role.inherits) {
		data.inherits = role.inherits
	}
	if (role.permissions) {
		data.permissions = role.permissions
	}

    client.hset(keyName, role.name, JSON.stringify(data), function (err, value) {
		
		client.quit()
		this.callCallback(callback, null)

	}.bind(this))
}

RedisDriver.prototype.setRoles = function (roles, callback) {
    
	this.removeAllRoles(function (err) {

		async.eachSeries(roles, function (role, cb) {

        		this.createRole( role, function (err) {
        			cb(null)
        		})
				
			}.bind(this),
			function done () {
				this.roles = roles
				this.callCallback(callback, null)
			}.bind(this)
		)

	}.bind(this))
}

RedisDriver.prototype.removeRoleByName = function (name, callback) {
	var client = this.generateClient()

    var index = this.getRoleIndexByName(name)
    if (index > -1) {
    	this.roles.splice(index, 1)
    }

    var keyName = ''

    async.series(
		[
			function (cb) {

				// Get all role rules
				keyName = this.getKeyName( 'rules_role_' + name )
				client.smembers(keyName, function (err, rules) {

					// Remove all role rules
					keyName = this.getKeyName( 'rules' )
					async.eachSeries(rules, function (rule, cb2) {

							// Remove role rule
							client.srem(keyName, rule, function (err, value) {
								cb2(null)
							})
						},
						function done () {
							cb(null)
						}
					)

				}.bind(this))

			}.bind(this),
			function (cb) {

				// Remove role
				keyName = this.getKeyName( 'roles' )
				client.hdel(keyName, name, function (err, value) {
					
					// Remove role rule index
					keyName = this.getKeyName( 'rules_role_' + name )
					client.del(keyName, function (err, value) {
						cb(null)
					})

				}.bind(this))

			}.bind(this)
		],
		function (err, results) {
			client.quit()
			this.callCallback(callback, null)
		}.bind(this)
	)
}

RedisDriver.prototype.removeAllRoles = function (callback) {
	var client = this.generateClient()

	var keyName = this.getKeyName( 'roles' )
	client.del(keyName, function (err) {
		
		client.quit()
		this.callCallback(callback, null)

	}.bind(this))
}

RedisDriver.prototype.getRoles = function (callback) {
	var client = this.generateClient()

	var keyName = this.getKeyName( 'roles' )
	client.hgetall(keyName, function (err, roles) {

		client.quit()
		if (err) {
			console.log(err)
			this.callCallback(callback, null)
			return
		}
		if (!roles) {
			this.callCallback(callback, null)
			return
		}

		var results = []
		for (var role in roles) {
			if (roles.hasOwnProperty(role)) {
				var data = JSON.parse(roles[role])
				data.name = role
				results.push(data)
			}
		}
		this.callCallback(callback, results)

	}.bind(this))
}

RedisDriver.prototype.getRoleByName = function (name, callback) {
   	this.getRoleIndexByName(name, function (index) {
   		if (index < 0) {
   			this.callCallback(callback, null)
   			return
   		}
   		this.callCallback(callback, this.roles[index])

   	}.bind(this)) 
}

RedisDriver.prototype.getRoleIndexByName = function (name, callback) {
    for (var r=0; r<this.roles.length; r++) {
        var role = this.roles[r]
        if (role.name == name) {
        	this.callCallback(callback, r)
            return
        }
   	}
   	this.callCallback(callback, -1)
}

RedisDriver.prototype.getRolePermissions = function (name, callback) {
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

RedisDriver.prototype.getInheritRoleNames = function (name, callback) {
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

RedisDriver.prototype.getUserRoles = function (user, callback) {

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

RedisDriver.prototype.createUserRule = function (userId, rule, callback) {
    var client = this.generateClient()

	var keyName = this.getKeyName( 'rules' )
	client.sadd(keyName, rule, function (err, value) {
		
		keyName = this.getKeyName( 'rules_user_' + userId )
		client.sadd(keyName, rule, function (err, value) {

			client.quit()
			this.callCallback(callback, null)

		}.bind(this))

	}.bind(this))
}

RedisDriver.prototype.removeUserRule = function (userId, rule, callback) {
	var client = this.generateClient()
    
	var keyName = this.getKeyName( 'rules' )
	client.srem(keyName, rule, function (err, value) {
		
		keyName = this.getKeyName( 'rules_user_' + userId )
		client.srem(keyName, rule, function (err, value) {
			
			client.quit()
			this.callCallback(callback, null)

		}.bind(this))

	}.bind(this))
}

RedisDriver.prototype.createRoleRule = function (name, rule, callback) {
    var client = this.generateClient()

	var keyName = this.getKeyName( 'rules' )
	client.sadd(keyName, rule, function (err, value) {
		
		keyName = this.getKeyName( 'rules_role_' + name )
		client.sadd(keyName, rule, function (err, value) {

			client.quit()
			this.callCallback(callback, null)

		}.bind(this))

	}.bind(this))
}

RedisDriver.prototype.removeRoleRule = function (name, rule, callback) {
	var client = this.generateClient()
    
	var keyName = this.getKeyName( 'rules' )
	client.srem(keyName, rule, function (err, value) {
		
		keyName = this.getKeyName( 'rules_role_' + name )
		client.srem(keyName, rule, function (err, value) {
			
			client.quit()
			this.callCallback(callback, null)

		}.bind(this))

	}.bind(this))
}

RedisDriver.prototype.removeAllRules = function (callback) {
	var client = this.generateClient()

	var keyName = this.getKeyName( 'rules' )
	client.del(keyName, function (err) {
		
		client.quit()
		this.callCallback(callback, null)

	}.bind(this))
}

RedisDriver.prototype.isRuleExists = function (rule, callback) {
	var client = this.generateClient()

	var keyName = this.getKeyName( 'rules' )
	client.sismember(keyName, rule, function (err, value) {
		
		client.quit()
		this.callCallback(callback, value)

	}.bind(this))
}

RedisDriver.prototype.getAllUserRules = function (userId, callback) {
	var rules = []

	this.getUserById(userId, function (user) {

		if (!user) {
			this.callCallback(callback, rules)
			return
		}

		this.getCustomUserRules(user.id, function (user_rules) {

			rules = rules.concat(user_rules)

			this.getUserRoles(user, function (roles) {

				async.eachSeries(roles, function (role, cb) {

						this.getRoleRules(role.name, function (role_rules) {

							rules = rules.concat(role_rules)
							cb(null)
						})

					}.bind(this),
					function done () {
						this.callCallback(callback, rules)
					}.bind(this)
				)

			}.bind(this))

		}.bind(this))	

	}.bind(this))
}

RedisDriver.prototype.getCustomUserRules = function (userId, callback) {
	var client = this.generateClient()

	var keyName = this.getKeyName( 'rules_user_' + userId )
	client.smembers(keyName, function (err, rules) {
		
		client.quit()
		this.callCallback(callback, rules)

	}.bind(this))
}

RedisDriver.prototype.getRoleRules = function (name, callback) {
	var client = this.generateClient()

	var keyName = this.getKeyName( 'rules_role_' + name )
	client.smembers(keyName, function (err, rules) {
		
		client.quit()
		this.callCallback(callback, rules)

	}.bind(this))
}

RedisDriver.prototype.getRules = function (callback) {
	var client = this.generateClient()

	var keyName = this.getKeyName( 'rules' )
	client.smembers(keyName, function (err, rules) {
		
		client.quit()
		this.callCallback(callback, rules)

	}.bind(this))
}

module.exports = RedisDriver
