// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: 'us-east-2'});
// Create EC2 service object
var ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
var params = {
 DryRun: false,
 InstanceIds: [
    "i-004aaa427b6176003"
 ]
};
// Call EC2 to retrieve policy for selected bucket
ec2.describeInstances(params, function(err, data) {
 if (err) {
 console.log("Error", err.stack);
 } else {
 console.log("Success, DNS", JSON.stringify(data.Reservations[0].Instances[0].PublicDnsName));
 console.log("IP Address", JSON.stringify(data.Reservations[0].Instances[0].PublicIpAddress));
 
}
});
