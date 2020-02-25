const path = require('path');
const fs   = require('fs');
const os   = require('os');

const child = require('child_process');

let identifyFile = path.join(os.homedir(), '.bakerx', 'insecure_private_key');

module.exports = function(src, dest) {
    let scpArgs = `-i "${identifyFile}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${src} ${dest} `.split(' ');

    return child.spawnSync(`scp`, scpArgs, {stdio: 'inherit', shell: true});
}
