const path = require('path');
const fs   = require('fs');
const os   = require('os');

const child = require('child_process');

let identifyFile = path.join(os.homedir(), '.bakerx', 'insecure_private_key');

module.exports = function(cmd, host) {
    let sshArgs = `-i "${identifyFile}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${host} ${cmd}`.split(' ');

    return child.spawnSync(`ssh`, sshArgs, {stdio: 'inherit', shell: true});
}
