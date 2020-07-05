const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');

const scpSync = require('../lib/scp');
const sshSync = require('../lib/ssh');

var monitor_push = require('../servers/commands/push.js');

exports.command = 'canary <blue> <green>';
exports.desc = 'Construct canary infrastructure, collect data, and perform analysis on the given branches.';
exports.builder = yargs => {
    yargs.options({
        privateKey: {
            describe: 'Install the provided private key on the configuration server',
            type: 'string'
        }
    });
};

exports.handler = async argv => {
    const {privateKey, blue, green} = argv;

    (async () => {

        await run(privateKey, blue, green);

    })();

};

const BLUE  = '192.168.44.20';
const GREEN = '192.168.44.21';
const TRAFFIC = '192.168.44.22';

async function run(privateKey, blue, green) {

    console.log(chalk.greenBright('Canary Analysis'));
    console.log(chalk.magenta(`Reporting analysis for BLUE:${blue} GREEN:${green} branches.`));

    console.log(chalk.greenBright('Installing servers for canary analysis!'));

    // Blue server initialization
    console.log(chalk.blueBright('\nProvisioning blue server...'));
    let result = child.spawnSync(`bakerx`, `run blue-srv queues --ip ${BLUE} --sync --memory 3072`.split(' '), {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    // Green server initialization
    console.log(chalk.blueBright('\nProvisioning green server...'));
    result = child.spawnSync(`bakerx`, `run green-srv queues --ip ${GREEN} --sync --memory 3072`.split(' '), {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    // Traffic server initialization
    console.log(chalk.blueBright('\nProvisioning traffic server...'));
    result = child.spawnSync(`bakerx`, `run traffic-srv queues --ip ${TRAFFIC} --sync --memory 3072`.split(' '), {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    // Clone blue branch
    console.log(chalk.blueBright(`\nCloning ${blue} branch to blue server`));
    result = sshSync(`cd /tmp/; if [ -d "checkbox.io-micro-preview" ]; then rm -Rf "checkbox.io-micro-preview"; fi; git clone -b ${blue} https://github.com/chrisparnin/checkbox.io-micro-preview.git; sudo npm install forever -g`, `vagrant@${BLUE}`);
    if( result.error ) { process.exit( result.status ); }

    // Clone green branch
    console.log(chalk.blueBright(`\nCloning ${green} branch to green server`));
    result = sshSync(`cd /tmp/; if [ -d "checkbox.io-micro-preview" ]; then rm -Rf "checkbox.io-micro-preview"; fi; git clone -b ${green} https://github.com/chrisparnin/checkbox.io-micro-preview.git; sudo npm install forever -g`, `vagrant@${GREEN}`);
    if( result.error ) { process.exit( result.status ); }

    // node index.js push
    monitor_push.run();

    // Run checkbox on both servers
    console.log(chalk.blueBright(`\nRun checkbox on blue server`));
    result = sshSync(`cd /tmp/ ; cd checkbox.io-micro-preview; npm install ; forever start index.js`, `vagrant@${BLUE}`);
    if( result.error ) { process.exit( result.status ); }

    console.log(chalk.blueBright(`\nRun checkbox on green serverr`));
    result = sshSync(`cd /tmp/ ; cd checkbox.io-micro-preview; npm install ; forever start index.js`, `vagrant@${GREEN}`);
    if( result.error ) { process.exit( result.status ); }
  
    // npm install in dashboard
    console.log(chalk.blueBright('\nInstalling dependencies for traffic monitoring app'));
    result = sshSync('cd /bakerx/canary_monitor; npm install ; node app.js',  `vagrant@${TRAFFIC}`);
    if( result.error ) { process.exit( result.status ); }

    // Destroy VMs
    console.log(chalk.blueBright('\nDestroying Servers [Blue, Green, Traffic]'));
    child.exec('bakerx delete vm blue-srv; bakerx delete vm green-srv; bakerx delete vm traffic-srv', (err) => {
        if (err) {
            console.error(err)
        } 
    });
}
