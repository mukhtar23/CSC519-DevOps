const redis = require('redis');
const util  = require('util');
const os = require('os');
const si = require('systeminformation');

const TRAFFIC = '192.168.44.22'

// Calculate metrics.
class Agent
{
    memoryLoad()
    {
       //console.log( os.totalmem(), os.freemem() );
       return ((os.totalmem() - os.freemem())/os.totalmem())*100;
    }
    async cpu()
    {
       let load = await si.currentLoad();
       return load.currentload;
    }
}

(async () => 
{
    // Get agent name from command line.
    let args = process.argv.slice(2);
    main(args[0]);

})();

async function main(name)
{
    let agent = new Agent();

    let connection = redis.createClient(6379, TRAFFIC, {})
    connection.on('error', function(e)
    {
        console.log(e);
        process.exit(1);
    });
    let client = {};
    client.publish = util.promisify(connection.publish).bind(connection);

    // Push update ever 1 second
    setInterval(async function()
    {
        let payload = {
            memoryLoad: agent.memoryLoad(),
            cpu: await agent.cpu()
        };
        let msg = JSON.stringify(payload);
        await client.publish(name, msg);
        console.log(`Publishing to ${name} server : ${msg}`);
    }, 1000);
}
