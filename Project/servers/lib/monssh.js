const path = require('path');
const os   = require('os');

const child = require('child_process');

let identifyFile = path.join(os.homedir(), '.bakerx', 'insecure_private_key');

module.exports = function(cmd, host, port) {
    let sshArgs = [];
    sshArgs.push(`-i`);
    sshArgs.push(`"${identifyFile}"`);
    sshArgs.push(`-o`);
    sshArgs.push(`StrictHostKeyChecking=no`);
    sshArgs.push(`-o`);
    sshArgs.push(`UserKnownHostsFile=/dev/null`);
    sshArgs.push(`-p`);
    sshArgs.push(port);
    sshArgs.push(host);
    sshArgs.push(cmd);

    return child.spawnSync(`ssh`, sshArgs, {stdio: 'inherit', shell: true});
}