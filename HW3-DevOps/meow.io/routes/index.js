var express = require('express');
var router = express.Router();

const db = require('../data/db');

const redis = require('redis');
let client = redis.createClient(6379, '127.0.0.1', {});


// Task 3 and 4 -----------------------------------------
/* GET home page. */
router.get('/', async function(req, res, next) {

  // task 3
  client.ttl("facts", async function(err, value){
    console.log(value)
    if (value < 0){
      // console.log("in in");
      client.lpush("facts", JSON.stringify((await db.votes()).slice(0,100)));
      client.EXPIRE("facts", 10);
    }

    client.LRANGE("facts", 0, 99, async function(err, value){

      // task 4
      client.lrange("cat", 0, 4, function(err, img){
        res.render('index', { title: 'meow.io', recentUploads: img, bestFacts: JSON.parse(value[0]) })

      })
    })
  
  });

    // res.render('index', { title: 'meow.io', recentUploads: await db.recentCats(5), bestFacts: (await db.votes()).slice(0,100) });

});

module.exports = router;
