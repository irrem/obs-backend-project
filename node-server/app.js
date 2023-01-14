var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");

//create application/json parser
var jsonParser = bodyParser.json();

const uri = "mongodb+srv://admin:Admin12120.@cluster0.k88achw.mongodb.net/test";

const client = new MongoClient(uri);

//need auth
app.post("/login",async function(req,res){

})

app.post("/forgotPassword",async function(req,res){
  
})

//need auth
app.get("/admin/getStudents", async function (req, res) {
    await client.connect(async function (err, db) {
        if (err) throw err;
    
        var dbo = db.db("dist-proj");

        all.forEach(element => {
          console.log(element._id,element.name);
        });
        await dbo.collection("users")
        .find({})
        .toArray()
        .then((item)=>{
          res.send(item);
        })
      
      });
    
});

app.post("/admin/createStudent", jsonParser, function (req, res) {
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

app.post("/admin/deleteStudent", jsonParser, function (req, res) {
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

app.post("/admin/createLessons", jsonParser, function (req, res) {
  client.connect(function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");
    var myobj = req.body;
    let lessons={
      lessonName:lessonName,
      ACTS:ACTS,
      lessonCode:lessonCode,
      lessonGrade:lessonGrade
    }

    dbo.collection("lessons").insertOne(myobj, function (err2, res2) {
      if (err2) throw err2;

      console.log("1 document inserted");

      db.close();
    });
  });

  res.send("success");
});

//get student profile
app.post("/student/getProfile", jsonParser, function (req, res) {
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

app.post("/student/updateProfile", jsonParser, function (req, res) {
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

app.get("/student/getLessons",async function(req,err){
  await client.connect(async function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");

    all.forEach(element => {
      console.log(element._id,element.name);
    });
    await dbo.collection("lessons")
    .find({})
    .toArray()
    .then((item)=>{
      res.send(item);
    })
  
  });
});

app.post("/student/addLessons",jsonParser,function(req,err){
  client.connect(function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");
    var myobj = req.body;

    dbo.collection("studentCurrentLessons").insertOne(myobj, function (err2, res2) {
      if (err2) throw err2;

      console.log("1 lesson inserted");

      db.close();
    });
  });

  res.send("success lesson inserted");
});

app.post("/student/breakLessons",jsonParser,function(req,err){
  const lessonId = req.body.lessonId;

  client.connect(function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");
    dbo
      .collection("studentCurrentLessons")
      .findOneAndDelete({ lessonId: lessonId })
      .then(() => {
        res.send("student deleted successfully");
      })
      .catch(error=>
        res.send("an error occured! ",error));
  });
});

//gettranscript
app.get("/student/getTranscript",function(req,err){

});

// getabsenteeism (yoklama)
app.get("/student/getAbsenteeism",function(req,err){

});

//add community info topluluk adi, ogrenci
app.post("/student/addCommunity",jsonParser,function(req,err){

});

//get community info
app.get("/student/getCommuntiyInfo",function(req,err){

});

//add Application (basvuru cap/yan dal) bolum ad, userid, basvurulacak sey
app.post("/student/addApplication",jsonParser,function(req,err){

});




app.listen(3000, function () {
  console.log("Server Started 3000 test çalışıyor");
});