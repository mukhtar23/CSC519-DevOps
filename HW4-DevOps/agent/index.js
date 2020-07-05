const redis = require('redis');
const util  = require('util');
const os = require('os');
const si = require('systeminformation');

// Calculate metrics.
// TASK 1:
class Agent
{
    memoryLoad()
    {
        console.log( os.totalmem(), os.freemem() );
        var percentage = (os.totalmem() - os.freemem())/os.totalmem();
        return percentage*100;
        // var m = await si.mem();
        // var p = m.used/m.total
        // return p*100;
        // return 0;
    }
    async cpu()
    {
       let load = await si.currentLoad();
       return load.currentload;
       // return 0;
    }

    // TASK 5
    async cpuSpeed()
    {
        let speed = (await si.cpu()).speed;
        return speed;
    }

    async ram()
    {
        let ram = (await si.mem()).total;
        return Math.round(ram/1000000000);
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

    let connection = redis.createClient(6379, '192.168.44.92', {})
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
            cpu: await agent.cpu(),
            speed: await agent.cpuSpeed(),
            ram: await agent.ram()
        };
        // await agent.uptime();
        let msg = JSON.stringify(payload);
        await client.publish(name, msg);
        console.log(`${name} ${msg}`);
    }, 1000);

}



