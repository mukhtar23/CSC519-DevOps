const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const got    = require("got");

const fs = require('fs');

const scpSync = require('../lib/scp');
const sshSync = require('../lib/ssh');

// api token for rest calls
var config = {};

// ssh key to ssh into vms
var ssh_key;

// header to use our token when making REST api requests
var headers;

var checkboxIp;
var itrustIp;
var monitorIp;

var dropletId;

var ipsAdded = 0;

exports.command = 'prod up';
exports.desc = 'Provision cloud instances and control plane';
exports.builder = yargs => {
    yargs.options({
    });
};


exports.handler = async argv => {
    const { } = argv;

    (async () => {

        await run( );

    })();

};

class DigitalOceanProvider
{
	async createDroplet (dropletName, region, imageName )
	{
		if( dropletName == "" || region == "" || imageName == "" )
		{
			console.log( chalk.red("You must provide non-empty parameters for createDroplet!") );
			return;
		}

		var data = 
		{
            "name": dropletName,
			"region":region,
			"size":"s-1vcpu-3gb",
			"image":imageName,
			"ssh_keys":[ssh_key],
			"backups":false,
			"ipv6":false,
			"user_data":null,
			"private_networking":null
		};

		console.log("Attempting to create: "+ dropletName );

		let response = await got.post("https://api.digitalocean.com/v2/droplets", 
		{
			headers:headers,
			json:true,
			body: data
		}).catch( err => 
			console.error(chalk.red(`createDroplet: ${err}`)) 
		);

		if( !response ) return;

		// console.log(response.statusCode);
		// console.log(response.body);

		if(response.statusCode == 202)
		{
			dropletId = response.body.droplet.id
			console.log(chalk.green(`Created droplet id ${dropletId}`));
			await this.dropletInfo(dropletName, dropletId);
		}
	}

	async dropletInfo (name, id)
	{

		var ip;

		if( typeof id != "number" )
		{
			console.log( chalk.red("You must provide an integer id for your droplet!") );
			return;
		}

		// Make REST request


		// let response = await got('https://api.digitalocean.com/v2/droplets/' + id, { headers: headers, json:true })
		// 					.catch(err => console.error(`dropletinfo ${err}`));

		// if( !response ) return;

		// if( response.body.droplet )
		// {
					// 	let droplet = response.body.droplet;
					// 	// console.log(droplet);
			

		// 			// Print out IP address
		// 			// ip = droplet.networks.v4[0].ip_address
		// 			// console.log(`IP Address: ${ip}`);
		// }


		var ping = setInterval(async function(){
			let response = await got('https://api.digitalocean.com/v2/droplets/' + id, { headers: headers, json:true })
			.catch(err => console.error(`dropletinfo ${err}`));

			if( !response ) return;

			if( response.body.droplet )
			{
				let droplet = response.body.droplet;
				// console.log(droplet);

				if(droplet.status == "active"){

					console.log(`${name} VM active`);
					
					// Print out IP address
					ip = droplet.networks.v4[0].ip_address
					console.log(`IP Address: ${ip}`);

					if(name == "checkbox.io"){
						checkboxIp = ip;
						ipsAdded++;
						writeFile("checkbox", ip);
					}else if(name == "iTrust"){
						itrustIp = ip;
						ipsAdded++;
						writeFile("itrust", ip);
					}else if(name == "monitor"){
						monitorIp = ip;
						ipsAdded++;
						writeFile("monitor", ip);
					}

					clearInterval(ping);
				}
			}

		}, 5000);

	}

	async deleteDroplet(id)
	{
		if( typeof id != "number" )
		{
			console.log( chalk.red("You must provide an integer id for your droplet!") );
			return;
		}

		// HINT, use the DELETE verb.

		let response = await got.delete('https://api.digitalocean.com/v2/droplets/' + id, { headers: headers, json:true })
							.catch(err => console.error(`dropletDelete ${err}`));

		if( !response ) return;

		// No response body will be sent back, but the response code will indicate success.
		// Specifically, the response code will be a 204, which means that the action was successful with no returned body data.
		if(response.statusCode == 204)
		{
			console.log(`Deleted droplet ${id}`);
		}

	}

};


async function provision()
{
	let client = new DigitalOceanProvider();

    var checkbox = "checkbox.io";
    var itrust = "iTrust";
    var monitor = "monitor";
	var region = "nyc1";
    var image = "ubuntu-18-04-x64"; 
    
	// dropletId = 189626092;
	await client.createDroplet(checkbox, region, image);

	await client.createDroplet(itrust, region, image);

	await client.createDroplet(monitor, region, image);


}


async function run() {

	fs.writeFile('pipeline/cloud_inventory.ini', '', function (err) {
		if (err) throw err;
		console.log('Reset Inventory File');
	})

	console.log(chalk.greenBright('Prod cloud server!'));
	// Retrieve our api token from the environment variables.
	config.token = process.env.CSC519_PROJECT_M3;
	ssh_key = process.env.DIGITAL_OCEAN_SSH_KEY;
	
	if( !config.token )
	{
		console.log(chalk`{red.bold CSC519_PROJECT_M3 is not defined!}`);
		console.log(`Please set your environment variables with appropriate token.`);
		console.log(chalk`{italic You may need to refresh your shell in order for your changes to take place.}`);
		process.exit(1);
	}

	if(!ssh_key){
		console.log(chalk`{red.bold DIGITAL_OCEAN_SSH_KEY is not defined!}`)
	}

	console.log(chalk.green(`Your token is: ${config.token.substring(0,4)}...`));

	// Configure our header
	headers =
	{
		'Content-Type':'application/json',
		Authorization: 'Bearer ' + config.token
	};

	await provision();
}


function writeFile(name, ip){

	var inventory = "[" + name + "]\n" + ip + "   ansible_ssh_private_key_file=~/.ssh/m3_rsa    ansible_user=root\n\n["+ name+ ":vars]\nansible_ssh_common_args='-o StrictHostKeyChecking=no'\n\n";

	fs.appendFile('pipeline/cloud_inventory.ini', inventory, function (err) {
		if (err) throw err;
		console.log(`Added IP Address for ${name} to inventory file`);
	})
}
