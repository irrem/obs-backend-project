var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");

// create application/json parser
var jsonParser = bodyParser.json();

const uri = "mongodb+srv://admin:Admin12120.@cluster0.k88achw.mongodb.net/test";

const client = new MongoClient(uri);

app.get("/get/users", function (req, res) {
    client.connect(function (err, db) {
        if (err) throw err;
    
        var dbo = db.db("dist-proj");

       res.send(dbo.collection("users").find({}));
      });
    
});

app.post("/get/users", jsonParser, function (req, res) {
  const name = req.body.name;

  client.connect(function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");

    dbo
      .collection("users")
      .findOne({ name: name })
      .then((item) => {
        res.send(item);
      });
  });
});

app.post("/create/users", jsonParser, function (req, res) {
  client.connect(function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");
    var myobj = req.body;

    dbo.collection("users").insertOne(myobj, function (err2, res2) {
      if (err2) throw err2;

      console.log("1 document inserted");

      db.close();
    });
  });

  res.send("success");
});

app.listen(8081, function () {
  console.log("Server Started 8081");
});