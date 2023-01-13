var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");

//create application/json parser
var jsonParser = bodyParser.json();

const uri = "mongodb+srv://admin:Admin12120.@cluster0.k88achw.mongodb.net/test";

const client = new MongoClient(uri);

app.get("/get/users", async function (req, res) {
    await client.connect(async function (err, db) {
        if (err) throw err;
    
        var dbo = db.db("dist-proj");
       
        var all= dbo
        .collection("users").find({});

        all.forEach(element => {
          console.log(element._id,element.name);
        });
        await dbo.collection("users").find({}).toArray().then((item)=>{
          console.log(item,"pending fin")
        })
      
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

app.post("/delete/users", jsonParser, function (req, res) {
  const name = req.body.name;

  client.connect(function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");
    dbo
      .collection("users")
      .findOneAndDelete({ name: name })
      .then(() => {
        res.send("student deleted successfully");
      })
      .catch(error=>
        res.send("an error occured! ",error));
  });
});

app.post("/update/users", jsonParser, function (req, res) {
  const name = req.body.name
  let updatedData={
    name:req.body.name,
    surname:req.body.surname
  }
  client.connect(function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");
    dbo
      .collection("users")
      .findOneAndUpdate({ name: name},{$set:updatedData})
      .then(() => {
        res.send("student updated successfully");
      })
      .catch(error=>
        res.send("an error occured! ",error));
  });
});


// login
// forgetpassword
// add lessons
// get lessons
// break lessons delete
// get profile
// update profile
// gettranscript
// getabsenteeism (yoklama)
//add community info topluluk adi, ogrenci
//get community info
//add Application (basvuru cap/yan dal) bolum ad, userid, basvurulacak sey

app.listen(3000, function () {
  console.log("Server Started 3000 test çalışıyor");
});