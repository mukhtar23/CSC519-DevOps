const jenkins = require('jenkins')({ baseUrl: 'http://admin:admin@192.168.33.20:9000', crumbIssuer: true, promisify: true });

async function getBuildStatus(job, id) {
    return new Promise(async function(resolve, reject)
    {
        console.log(`Fetching ${job}: ${id}`);
        let result = await jenkins.build.get(job, id);
        resolve(result);
    });
}

async function waitOnQueue(id) {
    return new Promise(function(resolve, reject)
    {
        jenkins.queue.item(id, function(err, item) {
            if (err) throw err;
            // console.log('queue', item);
            if (item.executable) {
                console.log('Build Number:', item.executable.number);
                resolve(item.executable.number);
            } else if (item.cancelled) {
                console.log('cancelled');
                reject('canceled');
            } else {
                setTimeout(async function() {
                    resolve(await waitOnQueue(id));
                }, 1000);
            }
        });
    });
  }
  

async function triggerBuild(job) 
{
    let queueId = await jenkins.job.build(job);
    let buildId = await waitOnQueue(queueId);

    return buildId;
}

async function main()
{

    console.log('#### TRIGGERING BUILD ####')
    let buildId = await triggerBuild('checkbox.io').catch( e => console.log(e));

    // this prints build output in real time
    console.log('\n#### STREAMING BUILD OUTPUT ####\n')
    var log = jenkins.build.logStream('checkbox.io', buildId);
 
    log.on('data', function(text) {
        process.stdout.write(text);
    });
    
    log.on('error', function(err) {
        
    });
    
    log.on('end', function() {
        jenkins.build.get('checkbox.io', buildId, function(err, data) {
            if (err) throw err;
            
            console.log('\nBUILD STATUS:', data.result);
            });
        
            console.log('\n#### END OF BUILD OUTPUT ####');
    });


    // this waits for the build to finish and then prints build log

    // console.log(`Received ${buildId}`);
    // let build = await getBuildStatus('checkbox.io', buildId);
    // console.log( `Build result: ${build}` );

    // console.log(`Build output`);
    // let output = await jenkins.build.log({name: 'checkbox.io', number: buildId});
    // console.log( output );

}

(async () => {

    await main();

})()
