# Gardien [![SlugBay Badge](https://www.slugbay.com/pictures/badges/slugbay-simple.svg)](https://www.slugbay.com)

[![NPM](https://nodei.co/npm/gardien.png?downloads=true)](https://nodei.co/npm/gardien/) [![NPM](https://nodei.co/npm-dl/gardien.png?months=5&height=2)](https://nodei.co/npm/gardien/)

The most **simple, flexible and easy to use** JavaScript role/access control list (**ACL, RBAC**) library.

 Features
-----
 * Support **Users**
 * Support **Roles**
 * Support **Hierarchies**
 * Support **Resources**
 * Support the **wildcard** notation define Users, Roles, Resources and Permissions.
 * Database **agnostic** by drivers you can write
 * **Very low** database memory consumption
 * **Very fast** rules memory checks based on regexes

Installation
-----
<h4>NodeJS</h4>
To install Gardien module from npm repository :

```sh
  npm install gardien
```
<h4>Browser</h4>
To install Gardien in browser, just insert this tag in your html :

```html
  <script src="cherubin.js" type="text/javascript"></script>
```

Usage in NodeJS
-----
<h4>Manage users, roles, rules and permissions from your backend</h4>

```javascript
var async = require('async')
var Gardien = require('gardien')

// Memory Driver or...
//var driver = new Gardien.drivers.MemoryDriver()

// Redis Driver
var driver = new Gardien.drivers.RedisDriver({
    prefix: 'gardien',
    separator: ':',
    index: 0,
    options: {}
})

// Setting an Seraphin to manage users, roles, rules and permissions
var seraphin = new Gardien.Seraphin( driver, {
    debug: true
})

async.series(
    [
        function (cb) {
            // Seraphin initialization
            seraphin.init(function (err) {
                cb(null)
            })
        },
        function (cb) {
            // Specify all your desired roles
            var roles = [
                {
                    name: 'guest',
                    permissions: [
                        'view'
                    ]
                },
                {
                    name: 'member',
                    inherits: 'guest', // This role inherits all (guest)'s permissions
                    permissions: [
                        'create',
                        'edit',
                        'like'
                    ]
                },
                {
                    name: 'lead',
                    inherits: 'member', // This role inherits all (member)'s permissions
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

            // Create all roles
            seraphin.setRoles(roles, function (err) {
                cb(null)
            })
        },
        function (cb) {
            // Create a user oothko which have 2 roles (member) and (team)
            seraphin.createUser( 'oothkoo', ['member','team'], function (err) {
                cb(null)
            })
        },
        function (cb) {
            // Create a user mario which have only (owner) role
            seraphin.createUser( 'mario', ['owner'], function (err) {
                cb(null)
            })
        },
        function (cb) {
            // Allow (guest)'s permissions on all resources
            seraphin.allowRole( 'guest', ['*'], function (err) {
                cb(null)
            })
        },
        function (cb) {
            // Allow (member)'s permissions on all resources
            seraphin.allowRole('member', ['*'], function (err) {
                cb(null)
            })  
        },
        function (cb) {
            // Allow (lead)'s permissions on all resources
            seraphin.allowRole('lead', ['*'], function (err) {
                cb(null)
            })  
        },
        function (cb) {
            // Allow (owner)'s permissions on all resources
            seraphin.allowRole('owner', ['*'], function (err) {
                cb(null)
            })
        },
        function (cb) {
            // Allow (team)'s permissions on all library resources
            seraphin.allowRole('team', ['library'], function (err) {
                cb(null)
            })
        },
        function (cb) {
            // Allow user (oothkoo) to delete all resources
            seraphin.allowUser('oothkoo', ['*'], ['delete'], function (err) {
                cb(null)
            })
        },
        function (cb) {
            // Show all system roles
            seraphin.showRoles(function (err) {
                cb(null)
            })
        },
        function (cb) {
            // Show all system rules
            seraphin.showRules(function (err) {
                cb(null)
            })
        },
        function (cb) {
            // Show all users rules
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
```

<h4>Check user's permissions from your backend</h4>


```javascript
var async = require('async')
var Gardien = require('gardien')

// Setting Redis Driver
var driver = new Gardien.drivers.RedisDriver({
    prefix: 'gardien',
    separator: ':',
    index: 0,
    options: {}
})

// Setting an Seraphin to get user rules
var seraphin = new Gardien.Seraphin( driver, {
    debug: true
})

// Setting an Cherubin to check user's permissions
var cherubin = new Gardien.Cherubin( {
    debug: true
})

// Setting user id
var userId = 'oothkoo'

async.series(
    [
        function (cb) {
            // Seraphin initialization
            seraphin.init(function (err) {
                cb(null)
            })
        },
        function (cb) {
            // Retrieve all user (oothkoo) rules
            seraphin.getAllUserRules(userId, function (rules) {

                // Give all rules to our cherubin
                cherubin.updateRules( rules )
                console.log('rules', rules)
                cb(null)
            })
        }
    ],
    function (err, results) {
        // Check if (oothkoo) is allowed to view humans across his all roles
        console.log('allowed: ' + cherubin.isAllowed(userId, ['*'], ['human'], ['view']) )
    }
)
```

Usage in Browser
-----
<h4>Check user's permissions from our browser</h4>


```javascript
// Setting an Cherubin to check user's permissions
var cherubin = new Cherubin( {
    debug: true
})

/* Retrieve all your user rules from your custom API/service
 (Use seraphin.getAllUserRules() from your backend to do that)
 and give all rules in your Javascript application to cherubin */
cherubin.updateRules( ... )

// Now you can check all permssions you want ;-)
console.log('allowed: ' + cherubin.isAllowed(userId, ['*'], ['human'], ['view']) )
```

Cherubin - API
-----
 * updateRules (**rules**)
 * isAllowed (**userId, roles, resources, permissions**)

Seraphin - API
-----
 * createUser (**userId, roles, callback**)
 * removeUserById (**userId, callback**)
 * getUserById (**userId, callback**)
 * getUserIndexById (**userId, callback**)
 * getUsers (**callback**)
 * createRole (**role, callback**)
 * setRoles (**roles, callback**)
 * removeRoleByName (**name, callback**)
 * removeAllRoles (**callback**)
 * getRoles (**callback**)
 * getRoleByName (**name, callback**)
 * getRoleIndexByName (**name, callback**)
 * getRolePermissions (**name, callback**)
 * getInheritRoleNames (**name, callback**)
 * getUserRoles (**user, callback**)
 * createUserRule (**userId, rule, callback**)
 * removeUserRule (**userId, rule, callback**)
 * createRoleRule (**name, rule, callback**)
 * removeRoleRule (**name, rule, callback**)
 * removeAllRules (**callback**)
 * isRuleExists (**rule, callback**)
 * getAllUserRules (**userId, callback**)
 * getCustomUserRules (**userId, callback**)
 * getRoleRules (**name, callback**)
 * getRules (**callback**)
 * showRules (**callback**)
 * showUsers (**callback**)
 * showRoles (**callback**)
 * setDriver (**driver**)
 * init (**callback**)
 * allowUser (**userId, resources, permissions, callback**)
 * disallowUser (**userId, resources, permissions, callback**)
 * allowRole (**role, resources, callback**)
 * disallowRole (**role, resources, callback**)
