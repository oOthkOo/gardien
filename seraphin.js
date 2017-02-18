/****************
 * IMPORTS
 */

var async = require('async')

/****************
 * PRIVATE FUNCTIONS
 */

/****************
 * PUBLIC FUNCTIONS
 */

function Seraphin ( driver, options ) {
	this.options = options
	this.setDriver( driver )
}

Seraphin.prototype.createUser = function (userId, roles, callback) {
    this.driver.createUser(userId, roles, callback)
}

Seraphin.prototype.removeUserById = function (userId, callback) {
    this.driver.removeUserById(userId, callback)
}

Seraphin.prototype.getUserById = function (userId, callback) {
    this.driver.getUserById(userId, callback)
}

Seraphin.prototype.getUserIndexById = function (userId, callback) {
    this.driver.getUserIndexById(userId, callback)
}

Seraphin.prototype.getUsers = function (callback) {
    this.driver.getUsers(callback)
}

Seraphin.prototype.createRole = function (role, callback) {
   this.driver.createRole(role, callback)
}

Seraphin.prototype.setRoles = function (roles, callback) {
    this.driver.setRoles(roles, callback)
}

Seraphin.prototype.removeRoleByName = function (name, callback) { 
    this.driver.removeRoleByName(name, callback)
}

Seraphin.prototype.removeAllRoles = function (callback) { 
    this.driver.removeAllRoles(callback)
}

Seraphin.prototype.getRoles = function (callback) {
    this.driver.getRoles(callback)
}

Seraphin.prototype.getRoleByName = function (name, callback) {
    this.driver.getRoleByName(name, callback)
}

Seraphin.prototype.getRoleIndexByName = function (name, callback) {
    this.driver.getRoleIndexByName(name, callback)
}

Seraphin.prototype.getRolePermissions = function (name, callback) {
    this.driver.getRolePermissions(name, callback)
}

Seraphin.prototype.getInheritRoleNames = function (name, callback) {
    this.driver.getInheritRoleNames(name, callback)
}

Seraphin.prototype.getUserRoles = function (user, callback) {
    this.driver.getUserRoles(user, callback)
}

Seraphin.prototype.createUserRule = function (userId, rule, callback) {
    this.driver.createUserRule(userId, rule, callback)
}

Seraphin.prototype.removeUserRule = function (userId, rule, callback) { 
    this.driver.removeUserRule(userId, rule, callback)
}

Seraphin.prototype.createRoleRule = function (name, rule, callback) {
    this.driver.createRoleRule(name, rule, callback)
}

Seraphin.prototype.removeRoleRule = function (name, rule, callback) { 
    this.driver.removeRoleRule(name, rule, callback)
}

Seraphin.prototype.removeAllRules = function (callback) { 
    this.driver.removeAllRules(callback)
}

Seraphin.prototype.isRuleExists = function (rule, callback) {
    this.driver.isRuleExists(rule, callback)
}

Seraphin.prototype.getAllUserRules = function (userId, callback) {
    this.driver.getAllUserRules(userId, callback)
}

Seraphin.prototype.getCustomUserRules = function (userId, callback) {
    this.driver.getCustomUserRules(userId, callback)
}

Seraphin.prototype.getRoleRules = function (name, callback) {
    this.driver.getRoleRules(name, callback)
}

Seraphin.prototype.getRules = function (callback) {
    this.driver.getRules(callback)
}

Seraphin.prototype.showRules = function (callback) {
	this.driver.showRules(callback)
}

Seraphin.prototype.showUsers = function (callback) {
	this.driver.showUsers(callback)
}

Seraphin.prototype.showRoles = function (callback) {
	this.driver.showRoles(callback)
}

Seraphin.prototype.setDriver = function ( driver ) {
    this.driver = driver
}

Seraphin.prototype.callCallback = function (callback, value) {
    if (callback) {
        callback(value)
    }
}

Seraphin.prototype.init = function (callback) {
    this.driver.init(function (err) {

    	this.callCallback(callback, null)

    }.bind(this))
}

Seraphin.prototype.makeRule = function (userId, role, resource, permission) {
    return 'id:' + userId + ':ro:' + role + ':re:' + resource + ':pe:' + permission
}

Seraphin.prototype.makeUserRules = function (userId, resources, permissions, callback) {
    var rules = []
    for (var r=0; r<resources.length; r++) {
        var resource = resources[r]
        for (var p=0; p<permissions.length; p++) {
            var permission = permissions[p]
            rules.push( this.makeRule( userId, '*', resource, permission ) )
        }
    }
    this.callCallback(callback, rules)
}

Seraphin.prototype.makeRoleRules = function (role, resources, callback) {
    this.getRolePermissions( role, function (permissions) {

    	var rules = []
	    for (var r=0; r<resources.length; r++) {
	        var resource = resources[r]
	        for (var p=0; p<permissions.length; p++) {
	            var permission = permissions[p]
	            rules.push( this.makeRule( '*', role, resource, permission ) )
	        }
	    }

	    this.callCallback(callback, rules)

    }.bind(this))
}

Seraphin.prototype.allowUser = function (userId, resources, permissions, callback) {  
	this.makeUserRules(userId, resources, permissions, function (rules) {

		async.eachSeries(rules, function (rule, cb2) {

				this.createUserRule(userId, rule, function (err) {
					cb2(null)
				})
				
			}.bind(this),
			function done () {
				this.callCallback(callback, null)
			}.bind(this)
		)

	}.bind(this))
}

Seraphin.prototype.disallowUser = function (userId, resources, permissions, callback) {
	this.makeUserRules(userId, resources, permissions, function (rules) {

		async.eachSeries(rules, function (rule, cb2) {

				this.removeUserRule(userId, rule, function (err) {
					cb2(null)
				})
				
			}.bind(this),
			function done () {
				this.callCallback(callback, null)
			}.bind(this)
		)

	}.bind(this))
}

Seraphin.prototype.allowRole = function (role, resources, callback) {
    this.makeRoleRules(role, resources, function (rules) {

		async.eachSeries(rules, function (rule, cb2) {

				this.createRoleRule(role, rule, function (err) {
					cb2(null)
				})
				
			}.bind(this),
			function done () {
				this.callCallback(callback, null)
			}.bind(this)
		)

	}.bind(this))
}

Seraphin.prototype.disallowRole = function (role, resources, callback) {
    this.makeRoleRules(role, resources, function (rules) {

		async.eachSeries(rules, function (rule, cb2) {

				this.removeRoleRule(role, rule, function (err) {
					cb2(null)
				})
				
			}.bind(this),
			function done () {
				this.callCallback(callback, null)
			}.bind(this)
		)

	}.bind(this))
}

module.exports = Seraphin
