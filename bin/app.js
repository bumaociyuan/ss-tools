#!/usr/bin/env node

var exit = process.exit;
var fs = require('fs');
var os = require('os');
var path = require('path');
var pkg = require('../package.json');
var url = require('url');
var version = pkg.version;

var program = require('commander');
require('shelljs/global');

/**
 * Main program.
 */
process.exit = exit

program
    .version(version)
    .usage('[option]')
    .option('-t, --toggle', 'Toggle your shadowsocks global status.')
    .option('-u, --update', 'Update your pac from gfwlist.')
    .option('-a, --add-domain <domain>', 'Add domain to your `user-rule.txt` and `gfwlist.js`.')
    .parse(process.argv);

var shadowsocksPath = os.homedir() + '/.ShadowsocksX';
var userRulePath = shadowsocksPath + '/user-rule.txt';
var gwPath = shadowsocksPath + '/gw-shadowsocks.dnslist';
var gfwlistPath = shadowsocksPath + '/gfwlist.js';

// option
var inputURL = program.addDomain;
var toggle = program.toggle;
var update = program.update;

if (!exit.exited) {
    main();
}

function main() {

    if (update) {
        updateGFWList()
    } else if (toggle) {
        console.log('todo');
    } else if (inputURL) {

        // get host
        var data = url.parse(inputURL);
        var host = data.host;

        if (host != null) {
            // update user-rule.txt
            updateUserRule(host);
        } else {
            console.log('Input is not valid');
        }
    }
}

function updateUserRule(host) {
    var userRuleDomain = '||' + host + '\n';
    fs.appendFile(userRulePath, userRuleDomain, function(err) {
        console.log('Add ' + host + ' to your user-rule.ext');
        updateGFWList();
    });
}

function updateGFWList() {
    var installedGenpac = exec('command -v genpac >/dev/null 2>&1').code;
    if (installedGenpac == 0) {
        var result = exec('genpac --gfwlist-url=https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt --user-rule-from=' + userRulePath + ' -p "SOCKS5 127.0.0.1:1080" -o ' + gfwlistPath).output;
        console.log('Success update');
    } else {
        // plz install genpac 
        console.log('Please run `pip install genpac` before');
    }
}
