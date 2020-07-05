const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');

const scpSync = require('../lib/scp');
const sshSync = require('../lib/ssh');

exports.command = 'setup';
exports.desc = 'Provision and configure the configuration server';
exports.builder = yargs => {
    yargs.options({
        privateKey: {
            describe: 'Install the provided private key on the configuration server',
            type: 'string'
        },
        ghUser: {
            describe: 'username',
            type: 'string'
        },
        ghPass: {
            describe: 'password',
            type: 'string'
        }
    });
};


exports.handler = async argv => {
    const { privateKey, ghUser, ghPass } = argv;

    (async () => {

        await run( privateKey, ghUser, ghPass);

    })();

};

async function run(privateKey, ghUser , ghPass) {

    console.log(chalk.greenBright('Installing jenkins server!'));

    console.log(chalk.blueBright('Provisioning jenkins server...'));
    let result = child.spawnSync(`bakerx`, `run jenkins-srv bionic --ip 192.168.33.20 --sync --memory 3072`.split(' '), {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    console.log(chalk.blueBright('Installing privateKey on configuration server'));
    let identifyFile = privateKey || path.join(os.homedir(), '.bakerx', 'insecure_private_key');
    result = scpSync (identifyFile, 'vagrant@192.168.33.20:/home/vagrant/.ssh/jenkins_rsa');
    if( result.error ) { console.log(result); process.exit( result.status ); }

    console.log(chalk.blueBright('Running init script...'));
    result = sshSync('/bakerx/pipeline/server-init.sh', 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    // console.log(chalk.blueBright('Setting up Jenkins...'));
    // result = sshSync('/bakerx/pipeline/run-jenkins.sh /bakerx/pipeline/playbook.yml /bakerx/pipeline/inventory.ini', 'vagrant@192.168.33.20');
    // if( result.error ) { console.log(result.error); process.exit( result.status ); }

    console.log(chalk.blueBright('Setting up Jenkins...'));
    result = sshSync('/bakerx/pipeline/run-jenkins.sh /bakerx/pipeline/playbook.yml /bakerx/pipeline/inventory.ini' + ' ' + ghUser + ' ' + ghPass, 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
}