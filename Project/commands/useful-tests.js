const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
// const child = require('child_process');
const exec = require('child_process').exec;

const sshSync = require('../lib/ssh');


exports.command = 'useful-tests';
exports.desc = 'Count number of failures from iTrust test suite and display most useful tests by number of times failed.';
exports.builder = yargs => {
    yargs.options({
      c: {
        describe: 'Number of times to run the iTrust test suite',
        type: 'int'
    }
    });
};

exports.handler = async argv => {
  const { c } = argv;

    (async () => {

        await run(c);

    })();

};

var setup;

if(process.platform=='win32'){

  setup = "cp /tmp/iTrust2-v6/iTrust2/src/main/java/db.properties.template /tmp/iTrust2-v6/iTrust2/src/main/java/db.properties;" +
              "sed -i 's/password/password root/g' /tmp/iTrust2-v6/iTrust2/src/main/java/db.properties;" + 
              "sed -i 's/[[:space:]]*$//' /tmp/iTrust2-v6/iTrust2/src/main/java/db.properties;" +
              "cp /tmp/iTrust2-v6/iTrust2/src/main/java/email.properties.template /tmp/iTrust2-v6/iTrust2/src/main/java/email.properties;" +
              "sed -i 's/from/from devops3csc519@gmail.com/g' /tmp/iTrust2-v6/iTrust2/src/main/java/email.properties;" +
              "sed -i 's/username/username devops3csc519@gmail.com/g' /tmp/iTrust2-v6/iTrust2/src/main/java/email.properties;" +
              "sed -i 's/password/password D3v0p$3pass/g' /tmp/iTrust2-v6/iTrust2/src/main/java/email.properties";

}else{

  setup = "cp /tmp/iTrust2-v6/iTrust2/src/main/java/db.properties.template /tmp/iTrust2-v6/iTrust2/src/main/java/db.properties;" +
              "sed -i \"s/password/password root/g\" /tmp/iTrust2-v6/iTrust2/src/main/java/db.properties;" + 
              "sed -i \"s/[[:space:]]*$//\" /tmp/iTrust2-v6/iTrust2/src/main/java/db.properties;" +
              "cp /tmp/iTrust2-v6/iTrust2/src/main/java/email.properties.template /tmp/iTrust2-v6/iTrust2/src/main/java/email.properties;" +
              "sed -i \"s/from/from devops3csc519@gmail.com/g\" /tmp/iTrust2-v6/iTrust2/src/main/java/email.properties;" +
              "sed -i \"s/username/username devops3csc519@gmail.com/g\" /tmp/iTrust2-v6/iTrust2/src/main/java/email.properties;" +
              "sed -i \"s/password/password D3v0p$3pass/g\" /tmp/iTrust2-v6/iTrust2/src/main/java/email.properties";

}

// var setup = "cp /tmp/iTrust2-v6/iTrust2/src/main/java/db.properties.template /tmp/iTrust2-v6/iTrust2/src/main/java/db.properties;" +
//             "sed -i 's/password/password root/g' /tmp/iTrust2-v6/iTrust2/src/main/java/db.properties;" + 
//             "sed -i 's/[[:space:]]*$//' /tmp/iTrust2-v6/iTrust2/src/main/java/db.properties;" +
//             "cp /tmp/iTrust2-v6/iTrust2/src/main/java/email.properties.template /tmp/iTrust2-v6/iTrust2/src/main/java/email.properties;" +
//             "sed -i 's/from/from devops3csc519@gmail.com/g' /tmp/iTrust2-v6/iTrust2/src/main/java/email.properties;" +
//             "sed -i 's/username/username devops3csc519@gmail.com/g' /tmp/iTrust2-v6/iTrust2/src/main/java/email.properties;" +
//             "sed -i 's/password/password D3v0p$3pass/g' /tmp/iTrust2-v6/iTrust2/src/main/java/email.properties";

// var setup = "cp /tmp/iTrust2-v6/iTrust2/src/main/java/db.properties.template /tmp/iTrust2-v6/iTrust2/src/main/java/db.properties;" +
//             "sed -i \"s/password/password root/g\" /tmp/iTrust2-v6/iTrust2/src/main/java/db.properties;" + 
//             "sed -i \"s/[[:space:]]*$//\" /tmp/iTrust2-v6/iTrust2/src/main/java/db.properties;" +
//             "cp /tmp/iTrust2-v6/iTrust2/src/main/java/email.properties.template /tmp/iTrust2-v6/iTrust2/src/main/java/email.properties;" +
//             "sed -i \"s/from/from devops3csc519@gmail.com/g\" /tmp/iTrust2-v6/iTrust2/src/main/java/email.properties;" +
//             "sed -i \"s/username/username devops3csc519@gmail.com/g\" /tmp/iTrust2-v6/iTrust2/src/main/java/email.properties;" +
//             "sed -i \"s/password/password D3v0p$3pass/g\" /tmp/iTrust2-v6/iTrust2/src/main/java/email.properties";


async function run(c) {

    // run iTrust test suite and display most useful tests

    console.log(chalk.blueBright("Cloning iTrust repo"));
    let result = sshSync('cd /tmp/; git clone https://$gh_user:$gh_pass@github.ncsu.edu/engr-csc326-staff/iTrust2-v6.git', 'vagrant@192.168.33.20');
    if( result.error ) { process.exit( result.status ); }

    console.log(chalk.blueBright(`Setting up iTrust repo`));
    result = sshSync(setup, 'vagrant@192.168.33.20');
    if( result.error ) { process.exit( result.status ); }

    console.log(chalk.blueBright(`Creating database data`));
    result = sshSync('cd /tmp/iTrust2-v6/iTrust2/ ; mvn -f pom-data.xml process-test-classes', 'vagrant@192.168.33.20');
    if( result.error ) { process.exit( result.status ); }

    console.log(chalk.blueBright('Removing previous useful test counts'));
    result = sshSync('rm /bakerx/count.json', 'vagrant@192.168.33.20');
    if( result.error ) { process.exit( result.status ); }

    for(var i = 0; i < c; i++){

      console.log(chalk.greenBright(`\nRun #${i+1}\n`))

      console.log(chalk.blueBright(`Fuzzing files`));
      result = sshSync('node /bakerx/test/fuzzing.js /tmp/iTrust2-v6/iTrust2/src/main/java', 'vagrant@192.168.33.20');
      if( result.error ) { process.exit( result.status ); }

      console.log(chalk.blueBright(`Running test suite`));
      result = sshSync('cd /tmp/iTrust2-v6/iTrust2/; mvn clean test verify', 'vagrant@192.168.33.20');
      if( result.error ) { process.exit( result.status ); }

      console.log(chalk.blueBright('Adding test results to gathering struct'));
      result = sshSync('node /bakerx/test/count.js /tmp/iTrust2-v6/iTrust2/target/surefire-reports', 'vagrant@192.168.33.20');
      if( result.error ) { process.exit( result.status ); }

      console.log(chalk.blueBright(`Resetting the iTrust repository`));
      result = sshSync('cd /tmp/iTrust2-v6; git reset --hard HEAD', 'vagrant@192.168.33.20');
      if( result.error ) { process.exit( result.status ); }

    }

    console.log(chalk.blueBright("Deleting iTrust repo"));
    result = sshSync('rm -rf /tmp/iTrust2-v6', 'vagrant@192.168.33.20');
    if( result.error ) { process.exit( result.status ); }

    console.log(chalk.blueBright('Pulling and sorting test results from most failures to least failures'));
    var count = JSON.parse(fs.readFileSync('count.json'));
    console.log(`# of Runs: ${c}`);

    function order(jsObj){
      var sortedArray = [];
      for(var i in jsObj)
      {
          sortedArray.push([jsObj[i], i]);
      }
      return sortedArray.sort(function(a,b){return a[0] - b[0]}).reverse();
  }
  
    console.log(order(count)); //{file:number}
}
