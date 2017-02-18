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
    this.regexes = []
}

Cherubin.prototype.getTime = function () {
	return Math.round(new Date().getTime() / 1000)
}

Cherubin.prototype.updateRules = function ( rules ) {
    for (var r=0; r<rules.length; r++) {
        var rule = rules[r].replace(/\*/g, '.*')
        rule = rule.replace(/\:/g, '\\:')
        this.regexes.push( new RegExp( rule ) )
    }
}

Cherubin.prototype.makeRule = function ( userId, role, resource, permission ) {
    return 'id:' + userId + ':ro:' + role + ':re:' + resource + ':pe:' + permission
}

Cherubin.prototype.startCheck = function () {
	if (this.options.debug) {
		this.check_count = 0
		this.lastTime = this.getTime()
	}
}

Cherubin.prototype.endCheck = function () {
	if (this.options.debug) {
		console.log(this.check_count + ' checks in ' + (this.getTime() - this.lastTime) + ' ms')
	}
}

Cherubin.prototype.isAllowed = function ( userId, roles, resources, permissions ) {
	this.startCheck()
    var check_rules = []
    // Generate all check rules
    for (var ro=0; ro<roles.length; ro++) {
    	for (var re=0; re<resources.length; re++) {
        	for (var pe=0; pe<permissions.length; pe++) {
            	check_rules.push( this.makeRule(userId, roles[ro], resources[re], permissions[pe]) )
            }
        }
    }
    // Optimization: filter regexes by valid permissions
    var regs = []
    for (var r=0; r<this.regexes.length; r++) {
    	var regex = this.regexes[r]
    	for (var pe=0; pe<permissions.length; pe++) {
    		if (regex.toString().indexOf(permissions[pe]) > -1) {
				regs.push(regex)
    		}
    	}
    }
    // Check all specified rules
    for (var cru=0; cru<check_rules.length; cru++) {
    	var valid = false
    	for (var uru=0; uru<regs.length; uru++) { 
        	var regex = regs[uru]
            var rule = check_rules[cru]
           	var check = regex.test(rule)
            if (this.options.debug) {
                console.log('check: [' + regex + '] on [' + rule + '] -> ' + check)
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
