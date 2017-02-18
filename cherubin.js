/****************
 * IMPORTS
 */

/****************
 * PRIVATE FUNCTIONS
 */

/****************
 * PUBLIC FUNCTIONS
 */

function Cherubin ( options ) {
	this.options = options || {}
	this.lastTime = 0
	this.check_count = 0
    this.rules = []
}

Cherubin.prototype.getTime = function () {
	return new Date().getTime() / 1000
}

Cherubin.prototype.updateRules = function ( rules ) {
    this.rules = rules
}

Cherubin.prototype.makeRule = function ( userId, role, resource, permission ) {
    return 'id:' + userId + ':ro:' + role + ':re:' + resource + ':pe:' + permission
}

Cherubin.prototype.getRuleParts = function ( rule ) {
	var userId = ''
	var role = ''
	var resource = ''
	var permission = ''
    var m = rule.match( /id\:(.*):ro/ )
	if (m) {
		userId = m[1] || ''
	}
	m = rule.match( /ro\:(.*):re/ )
	if (m) {
		role = m[1] || ''
	}
	m = rule.match( /re\:(.*):pe/ )
	if (m) {
		resource = m[1] || ''
	}
	m = rule.match( /pe\:(.*)$/ )
	if (m) {
		permission = m[1] || ''
	}
	return {
		userId: userId,
		role: role,
		resource: resource,
		permission: permission
	}
}

Cherubin.prototype.isRuleMatch = function ( rule1, rule2 ) {
    var rule1_parts = this.getRuleParts( rule1 )
	var rule2_parts = this.getRuleParts( rule2 )
	var userOk = false
	if (rule1_parts.userId == rule2_parts.userId) {
		userOk = true
	}
	else if (rule1_parts.userId == '*' || rule2_parts.userId == '*') {
		userOk = true
	}
	var roleOk = false
	if (rule1_parts.role == rule2_parts.role) {
		roleOk = true
	}
	else if (rule1_parts.role == '*' || rule2_parts.role == '*') {
		roleOk = true
	}
	var resourceOk = false
	if (rule1_parts.resource == rule2_parts.resource) {
		resourceOk = true
	}
	else if (rule1_parts.resource == '*' || rule2_parts.resource == '*') {
		resourceOk = true
	}
	var permissionOk = false
	if (rule1_parts.permission == rule2_parts.permission) {
		permissionOk = true
	}
	else if (rule1_parts.permission == '*' || rule2_parts.permission == '*') {
		permissionOk = true
	}
	return userOk && roleOk && resourceOk && permissionOk
}

Cherubin.prototype.startCheck = function () {
	if (this.options.debug) {
		this.check_count = 0
		this.lastTime = this.getTime()
	}
}

Cherubin.prototype.endCheck = function () {
	if (this.options.debug) {
		console.log(this.check_count + ' checks in ' + (this.getTime() - this.lastTime).toFixed(3) + ' ms')
	}
}

Cherubin.prototype.isAllowed = function ( userId, roles, resources, permissions ) {
	this.startCheck()
    var check_rules = []
    // Generate all check regexes
    for (var ro=0; ro<roles.length; ro++) {
    	for (var re=0; re<resources.length; re++) {
        	for (var pe=0; pe<permissions.length; pe++) {
            	check_rules.push( this.makeRule( userId, roles[ro], resources[re], permissions[pe]) )
            }
        }
    }
	// Optimization: filter rules by valid permissions
    var system_rules = []
    for (var r=0; r<this.rules.length; r++) {
    	var rule = this.rules[r]
    	for (var pe=0; pe<permissions.length; pe++) {
			if (rule.indexOf( 'pe:' + permissions[pe] ) > -1) {
				system_rules.push(rule)
    		}
    	}
    }
    // Check all specified rules
    for (var cru=0; cru<check_rules.length; cru++) {
    	var valid = false
		var crule = check_rules[cru]

    	for (var uru=0; uru<system_rules.length; uru++) {
        	var urule = system_rules[uru]
           	var check = this.isRuleMatch( crule, urule )
            if (this.options.debug) {
                console.log('check: [' + crule + '] and [' + urule + '] -> ' + check)
            }
            if (check) {
            	valid = true
            }
            this.check_count++
        }
        if (!valid) {
        	this.endCheck()
            return false
        }
  	}
  	this.endCheck()
	return true
}

module.exports = Cherubin
