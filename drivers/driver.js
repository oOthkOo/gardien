/****************
 * IMPORTS
 */

/****************
 * PRIVATE FUNCTIONS
 */

/****************
 * PUBLIC FUNCTIONS
 */

function Driver () {

}

Driver.prototype.callCallback = function (callback, value) {
    if (callback) {
        callback(value)
    }
}

Driver.prototype.init = function (callback) {
    console.log('init - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.createUser = function (userId, roles, callback) {
    console.log('createUser - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.removeUserById = function (userId, callback) {
    console.log('removeUserById - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.getUserById = function (userId, callback) {
    console.log('getUserById - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.getUserIndexById = function (userId, callback) {
    console.log('getUserIndexById - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.getUsers = function (callback) {
    console.log('getUsers - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.createRole = function (role, callback) {
    console.log('createRole - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.setRoles = function (roles, callback) {
    console.log('setRoles - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.removeRoleByName = function (name, callback) {
    console.log('removeRoleByName - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.removeAllRoles = function (callback) {
    console.log('removeAllRoles - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.getRoles = function (callback) {
    console.log('getRoles - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.getRoleByName = function (name, callback) {
    console.log('getRoleByName - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.getRoleIndexByName = function (name, callback) {
    console.log('getRoleIndexByName - not implemented yet.')
    this.callCallback(callback, -1)
}

Driver.prototype.getRolePermissions = function (name, callback) {
    console.log('getRolePermissions - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.getInheritRoleNames = function (name, callback) {
    console.log('getInheritRoleNames - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.getUserRoles = function (user, callback) {
    console.log('getUserRoles - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.createUserRule = function (userId, rule, callback) {
    console.log('createUserRule - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.removeUserRule = function (userId, rule, callback) {
    console.log('removeUserRule - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.createRoleRule = function (name, rule, callback) {
    console.log('createRoleRule - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.removeRoleRule = function (name, rule, callback) {
    console.log('removeRoleRule - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.removeAllRules = function (callback) {
    console.log('removeAllRules - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.isRuleExists = function (rule, callback) {
    console.log('isRuleExists - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.getGlobalRules = function (userId, callback) {
    console.log('getGlobalRules - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.getUserRules = function (userId, callback) {
    console.log('getUserRules - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.getRoleRules = function (name, callback) {
    console.log('getRoleRules - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.getRules = function (callback) {
    console.log('getRules - not implemented yet.')
    this.callCallback(callback, null)
}

Driver.prototype.showRules = function (callback) {
    console.log()
    console.log('[Rules]')
    this.getRules(function (rules) {
        if (rules &&
            rules.length > 0) {
            for (var r=0; r<rules.length; r++) {
                console.log('rule: ' + rules[r])
            }
        }
        else {
            console.log('No rules.')
        }
        this.callCallback(callback, null)
    }.bind(this))
}

Driver.prototype.showUsers = function (callback) {
    console.log()
    console.log('[Users]')
    this.getUsers(function (users) {
        if (users &&
            users.length > 0) {
            for (var u=0; u<users.length; u++) {
                console.log('user: ', users[u])
            }
        }
        else {
            console.log('No users.')
        }
        this.callCallback(callback, null)
    }.bind(this))
}

Driver.prototype.showRoles = function (callback) {
    console.log()
    console.log('[Roles]')
    this.getRoles(function (roles) {
        if (roles &&
            roles.length > 0) {
            for (var r=0; r<roles.length; r++) {
                console.log('role: ', roles[r])
            }
        }
        else {
            console.log('No roles.')
        }
        this.callCallback(callback, null)
    }.bind(this))
}

module.exports = Driver
