const chalk = require('chalk');
const path = require('path');

const sshSync = require('../lib/monssh');
const scpSync = require('../lib/monscp');

var CHECKBOX;
var ITRUST;
const port = 22; // default ssh port

exports.command = 'push';
exports.desc = 'Install and update monitoring agent running on servers';
exports.builder = yargs => {
    yargs.options({
    });
};

exports.handler = async argv => {
    const {} = argv;

    (async () => {

        await run( );

    })();

};

async function run() {

    console.log(chalk.greenBright('Pushing monitoring agent to servers...'));

    CHECKBOX = process.env.CHECKBOX_IP;
    ITRUST = process.env.ITRUST_IP;

    let agentJS = path.join(__dirname, '../../cloud_agent/index.js');
    let package = path.join(__dirname, '../../cloud_agent/package.json');

    // Blue Green servers to be monitored
    let servers = {'checkbox':CHECKBOX, 'itrust':ITRUST};

    for( let key in servers )
    {
        console.log(chalk.keyword('pink')(`Updated agent on server: ${key}`));
        
        // push agent/index.js
        result = scpSync (port, agentJS, `root@${servers[key]}:/tmp/agent.js`);
        if( result.error ) { console.log(result.error); process.exit( result.status ); }
        // push agent/package.json
        result = scpSync (port, package, `root@${servers[key]}:/tmp/package.json`);
        if( result.error ) { console.log(result.error); process.exit( result.status ); }

        // Install packages and start forever process on all servers to be monitored.
        if( process.platform=='win32')
            result = sshSync(`"cd /tmp && npm install && forever stopall && forever start agent.js ${key}"`, `root@${servers[key]}`, port);
        else
        {
            result = sshSync(`'cd /tmp && npm install && forever stopall && forever start agent.js ${key}'`, `root@${servers[key]}`, port);
        }
        if( result.error ) { console.log(result.error); process.exit( result.status ); }
    }
}

module.exports.run = run;
