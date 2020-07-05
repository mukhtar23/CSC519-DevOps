const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const sshSync = require('../lib/ssh');


exports.command = 'simple';
exports.desc = 'simple test';
exports.builder = yargs => {
    yargs.options({
    });
};

exports.handler = async argv => {
    const {  } = argv;

    (async () => {

        run();

    })();

};

function run()
{
    // console.log(chalk.blueBright('\nSetting up Cloud Monitor VM'));
    // let result = sshSync('/bakerx/pipeline/run-jenkins.sh /bakerx/pipeline/monitor_playbook.yml /bakerx/pipeline/simple.ini $gh_user $gh_pass', 'vagrant@192.168.33.20');
    // if( result.error ) { console.log(result.error); process.exit( result.status ); }	

    console.log(chalk.blueBright('\nSetting up Cloud Monitor VM'));
    result = sshSync('ansible-playbook /bakerx/pipeline/monitor_playbook.yml -i /bakerx/pipeline/cloud_inventory.ini --vault-password-file /tmp/vault_pass.txt', 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }	
    
}

