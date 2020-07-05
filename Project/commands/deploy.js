const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const fs = require('fs')
const scpSync = require('../lib/scp');
const sshSync = require('../lib/ssh');

var checkbox;
var itrust;

var war = 0;

var monitor_push = require('../cloud_servers/commands/push.js');

exports.command = 'deploy <job>';
exports.desc = 'Provision cloud instances and control plane';
exports.builder = yargs => {
    yargs.options({
        inventory: {
            alias: 'i',
            describe: 'inventory file',
            type: 'string'
        },
    });
};


exports.handler = async argv => {
    const {job, inventory} = argv;

    (async () => {

        await run(job, inventory);

    })();

};


function copyFile(file){
    if( fs.existsSync(path.join(__dirname, '..',file))){
        fs.copyFile( path.join(__dirname, '..',file), path.join(__dirname, '..', 'pipeline', 'passed_inventory.ini'), (err) => {
            if (err) throw err;
            console.log('File was copied to destination');
        });
    } else {
        throw new Error(`File: <${file}> does not exist. Program terminated.`);
    }
}

async function run(job, inventory) {
    copyFile(inventory);
    checkbox = process.env.CHECKBOX_IP;
    itrust = process.env.ITRUST_IP;


    console.log(chalk.greenBright('Deploy'));
    console.log(chalk.magenta(`Running ${job} with ${inventory} inventory file.`));

    if(job == "iTrust"){

        console.log(chalk.blueBright('Creating War File for iTrust'));
        let result = child.spawnSync(`node index.js`, `build itrust_war`.split(' '), {shell:true, stdio: 'inherit'} );
        if( result.error ) { console.log(result.error); process.exit( result.status ); }

        // run playbook for itrust
        console.log(chalk.blueBright('\nDeploying itrust'));
        result = sshSync(`/bakerx/pipeline/run-jenkins.sh /bakerx/pipeline/itrust_playbook.yml /bakerx/pipeline/passed_inventory.ini $gh_user $gh_pass`, 'vagrant@192.168.33.20');
        if( result.error ) { console.log(result.error); process.exit( result.status ); }

  
    } else if( job == "checkbox.io"){

        console.log(chalk.blueBright('\nDeploying checkbox'));
        result = sshSync(`/bakerx/pipeline/run-jenkins.sh /bakerx/pipeline/checkbox_playbook.yml /bakerx/pipeline/passed_inventory.ini $gh_user $gh_pass`, 'vagrant@192.168.33.20');
        if( result.error ) { console.log(result.error); process.exit( result.status ); }

    } else if( job == "monitor"){

        console.log(chalk.blueBright('\nSetting up Cloud Monitor VM'));
        let result = sshSync(`ansible-playbook /bakerx/pipeline/monitor_playbook.yml -i /bakerx/pipeline/passed_inventory.ini --vault-password-file /tmp/vault_pass.txt`, 'vagrant@192.168.33.20');
        if( result.error ) { console.log(result.error); process.exit( result.status ); }
    }
}
