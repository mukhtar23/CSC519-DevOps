const chalk = require('chalk');
const path = require('path');
const os = require('os');

const got = require('got');
// const http = require('http');
// const httpProxy = require('http-proxy');

const exec = require('child_process').exec

var request = require('request');

// exports.command = 'serve';
// exports.desc = 'Run traffic proxy.';
// exports.builder = yargs => {};

// exports.handler = async argv => {
//     const { } = argv;

//     (async () => {

//         await run( );

//     })();

// };

const BLUE  = 'http://192.168.44.20:3000/preview';
const GREEN = 'http://192.168.44.21:3000/preview';

var time = 0;
var intervalTimer;

class Production
{
    constructor()
    {
      console.log(time);
      console.log("constructor");
      this.TARGET = BLUE;
      // intervalTimer = setInterval( this.healthCheck.bind(this), 1000 );
      this.healthCheck.bind(this);
    }

    // TASK 1: 
    proxy()
    {
        console.log("proxy");
//         let options = {};
//         let proxy   = httpProxy.createProxyServer(options);
//         let self = this;
//         // Redirect requests to the active TARGET (BLUE or GREEN)
//         let server  = http.createServer(function(req, res)
//         {
//             // callback for redirecting requests.
//             proxy.web( req, res, {target: self.TARGET } );
//         });
//         server.listen(3080);
   }

   failover()
   {
      this.TARGET = GREEN;
   }

   async healthCheck()
   {
      
      try 
      {
          console.log(`health check for ${this.TARGET}`);

        var options = {
            uri: this.TARGET,
            method: 'POST',
            json:{
              "markdown":"\n{NumberQuestions:true}\n-----------\nStart with header for global options:\n\n    {NumberQuestions:true}\n    -----------\n\n### Multiple Choice Question (Check all that apply)\n\nA *description* for question.  \nQuestions are created with headers (level 3) `### Multiple Choice Question (Check all that apply)`.\n\n* Choice A\n* Choice B\n* Choice C\n\n### Single Choice Question\n\nMarkdown is great for including questions about code snippets:\n```\n$(document).ready( function()\n{\n    ko.applyBindings(new TaskViewModel());\n\tvar converter = new Markdown.Converter();\n\tdocument.write(converter.makeHtml(\"**I am bold**\"));\n});\n```\n\n1. Choice\n2. Choice\n3. Choice\n\n### Ranking/Rating Table\n\nThe first column has the description.  [Use github flavored markdown for table formatting](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#wiki-tables).\n\n|                       | Do not Want | Sometimes | Always |\n| --------------------- | ----------- | --------- | ------ | \n| Search terms used in IDE\t                      |  |  |  |\n| Code that did not work out and was deleted.     |  |  |  |\n| Time spent on particular edits\t              |  |  |  |\n| Code and files viewed\t                          |  |  |  |\n"
            }

          };
          
          request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              console.log(body) // Print the shortened url.
            }else{
              console.log("status code not 200");
            }
          });
        // console.log(body.data);
      }
      catch (error) {
         console.log(error);
      }

      time += 5000;
      console.log(time);
      if(time == 150000){
        console.log("blue done");
        this.TARGET = GREEN;
      }

      if(time == 300000){
        console.log("green done");
        clearInterval(intervalTimer);
      }
   }
}

async function main() {

    // console.log(chalk.keyword('pink')('Starting traffic calls'));

    let prod = new Production();

    // return time;
}

module.exports.run = main;

