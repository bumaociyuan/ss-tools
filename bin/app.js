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
    .option('-a, --add-domain <domain>', 'Add domain to your gfwlist. Do not use -t and -a both.')
    .parse(process.argv);

var shadowsocksPath = os.homedir() + '/.ShadowsocksX';
var userRulePath = shadowsocksPath + '/user-rule.txt';
var gwPath = shadowsocksPath + '/gw-shadowsocks.dnslist';
var gfwlistPath = shadowsocksPath + '/gfwlist.js';

// option
var inputURL = program.addDomain;
var toggle = program.toggle;

if (!exit.exited) {
    main();
}

function main() {

    if (inputURL) {

        // get host
        var data = url.parse(inputURL);
        var host = data.host;

        if (host != null) {
            // update user-rule
            updateUserRule(host);

            // update gw-shadowsocks
            updateGW(host)
        } else {
            console.log('Input is not valid');
        }
    }
}

function updateGW(host) {
    var gwDomain = 'server=/' + host + '/127.0.0.1#53535\n'
    fs.appendFile(gwPath, gwDomain, function(err) {});
}

function updateUserRule(host) {
    var userRuleDomain = '||' + host + '\n';
    fs.appendFile(userRulePath, userRuleDomain, function(err) {
        updateGFWList();
    });
}

function updateGFWList() {
    var installedGenpac = exec('command -v genpac >/dev/null 2>&1').code;
    if (installedGenpac == 0) {
        var result = exec('genpac --gfwlist-url=https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt --user-rule-from=' + userRulePath + ' -p "SOCKS5 127.0.0.1:1080" -o ' + gfwlistPath).output;
        console.log('Success');
    } else {
        // plz install genpac 
        console.log('Please run `pip install genpac` before');
    }
}