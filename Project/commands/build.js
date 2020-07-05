const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const sshSync = require('../lib/ssh');

// to trigger builds in jenkins
const jenkins = require('jenkins')({ baseUrl: 'http://admin:admin@192.168.33.20:9000', crumbIssuer: true, promisify: true });

exports.command = 'build <job>';
exports.desc = 'Run build job on jenkins server';
exports.builder = yargs => {
    yargs.options({
    });
};

exports.handler = async argv => {
    const { job } = argv;

    (async () => {

        await run(job);

    })();

};

// code to trigger build for checkbox.io

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

// end of checkbox.io build code

async function run(job) {

    if (job == "checkbox.io") {
        // the paths should be from root of cm directory
        // Transforming path of the files in host to the path in VM's shared folder

        console.log(chalk.blueBright('Run jenkins jobs on checkbox.io'));
        let result = sshSync(`jenkins-jobs --conf /tmp/jenkins_jobs.ini update /tmp/checkbox_io_job.yml`, 'vagrant@192.168.33.20');
        if( result.error ) { process.exit( result.status ); }

        // console.log(chalk.blueBright(''));
        // let new_result = sshSync(`node /bakerx/triggerBuild.js`, 'vagrant@192.168.33.20');
        // if ( new_result.error ) { process.exit( new_result.status ); }
    }
    else if (job == "iTrust") {
        console.log(chalk.blueBright('Run jenkins jobs on iTrust'));
        let result = sshSync(`jenkins-jobs --conf /tmp/jenkins_jobs.ini update /tmp/itrust_job.yml`, 'vagrant@192.168.33.20');
        if( result.error ) { process.exit( result.status ); }
    }else if(job == "itrust_war"){
        console.log(chalk.blueBright('Run jenkins jobs on iTrust'));
        let result = sshSync(`jenkins-jobs --conf /tmp/jenkins_jobs.ini update /tmp/itrust_war_job.yml`, 'vagrant@192.168.33.20');
        if( result.error ) { process.exit( result.status ); }
    }

    console.log('#### TRIGGERING BUILD ####')
    let buildId = await triggerBuild(job).catch( e => console.log(e));

    // this prints build output in real time
    console.log('\n#### STREAMING BUILD OUTPUT ####\n')
    var log = jenkins.build.logStream(job, buildId);
    
    log.on('data', function(text) {
        process.stdout.write(text);
    });
    
    log.on('error', function(err) {
        
    });
    
    log.on('end', function() {
        jenkins.build.get(job, buildId, function(err, data) {
            if (err) throw err;
            
            console.log('\nBUILD STATUS:', data.result);
            });
        
            console.log('\n#### END OF BUILD OUTPUT ####');
    });
}

