const chalk = require('chalk');
const fs    = require('fs');
const os    = require('os');
const path  = require('path');

const VBoxManage = require('../lib/VBoxManage');

exports.command = 'ssh';
exports.desc = 'SSH into VM';
exports.builder = yargs => {
    yargs.options({
        force: {
            alias: 'f',
            describe: 'Force the old VM to be deleted when provisioning',
            default: false,
            type: 'boolean'
        }
    });
};

const spawn = require('child_process').spawn;

let identifyFile = path.join(os.homedir(), '.bakerx', 'insecure_private_key');
let sshExe = `ssh -i "${identifyFile}" -p 2800 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null vagrant@127.0.0.1 `;


exports.handler = async argv => {
    const { force } = argv;

    (async () => {
    
        await sshVM(force);

    })();

};

async function sshVM(force)
{
    // Use current working directory to derive name of virtual machine
    let cwd = process.cwd().replace(/[/]/g,"-").replace(/\\/g,"-");
    let name = `V-${cwd}`;    
    console.log(chalk.keyword('pink')(`Bringing up machine ${name}`));

    // We will use the image we've pulled down with bakerx.
    let image = path.join(os.homedir(), '.bakerx', '.persist', 'images', 'bionic', 'box.ovf');
    if( !fs.existsSync(image) )
    {
        console.log(chalk.red(`Could not find ${image}. Please download with 'bakerx pull cloud-images.ubuntu.com bionic'.`))
    }

    spawn('sh', ['-c', sshExe],{stdio: 'inherit'}, (error, stdout, stderr) => {

            console.log(error || stderr);
            console.log(stdout);
    
        });

}