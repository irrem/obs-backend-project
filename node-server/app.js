var express = require("express");
var app = express();
var ObjectId = require("mongodb").ObjectId;
var bodyParser = require("body-parser");
require("dotenv").config();

var jwt = require("jsonwebtoken");

const { MongoClient, ReturnDocument } = require("mongodb");

//create application/json parser
var jsonParser = bodyParser.json();

const uri = "mongodb+srv://admin:Admin12120.@cluster0.k88achw.mongodb.net/test";

const client = new MongoClient(uri);

async function checkRole(token) {
  var decoded = jwt.verify(token, process.env.JWT_KEY);
  var role = null;
  await client.connect(async function (err, db) {
    if (err) throw err;
    var dbo = db.db("dist-proj");
    await dbo
      .collection("users")
      .findOne({ username: decoded.username })
      .then((response) => {
        if (!response || response === null) {
          console.log("1")
          role = "notfound";
          console.log("1,",role)
        } else {
          console.log('2',response.role)
          return response.role;
        }
      });
   });
 return role;
}

//need auth
app.post("/login", jsonParser, async function (req, res) {
  client.connect(function (err, db) {
    if (err) throw err;
    var dbo = db.db("dist-proj");
    dbo
      .collection("users")
      .findOne({ username: req?.body?.username })
      .then((response) => {
        if (!response || response === null) {
          res.send("User not found.");
        } else if (
          response.username === req?.body?.username &&
          response.password === req?.body?.password
        ) {
          delete response.password;
          res.send({
            response,
            token: jwt.sign(
              { username: req?.body?.username, _id: response?._id },
              process.env.JWT_KEY
            ),
          });
        } else {
          res.send("Wrong password");
        }
      });
  });
});

app.post("/register", jsonParser, async function (req, res) {
  const { name, surname, password, username } = req.body;

  client.connect(function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");

    dbo.collection("users").insertOne(
      {
        name,
        surname,
        role: "user",
        department: "empty",
        grade: "empty",
        password,
        username,
      },
      function (err2, res2) {
        if (err2) throw err2;

        res.send({
          token: jwt.sign({ username }, process.env.JWT_KEY),
          status: 200,
        });

        db.close();
      }
    );
  });
});

app.post("/test", jsonParser, async function (req, res) {
  const { token } = req.body;

  checkRole(token).then((item) => res.send(item));
});

//need auth
app.get("/admin/getStudents", async function (req, res) {
  await client.connect(async function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");

    all.forEach((element) => {
      console.log(element._id, element.name);
    });
    await dbo
      .collection("users")
      .find({})
      .toArray()
      .then((item) => {
        res.send(item);
      });
  });
});

app.post("/admin/createStudent", jsonParser, function (req, res) {
  const { name, surname, grade, role, department, password, username, token } =
    req.body;

  var decoded = jwt.verify(token, process.env.JWT_KEY);

  client.connect(function (err, db) {
    if (err) throw err;
    var dbo = db.db("dist-proj");
    dbo
      .collection("users")
      .findOne({ username: decoded.username })
      .then((response) => {
        if (!response || response === null) {
          res.send("Error");
        } else {
          if (response.role === "admin") {
            dbo
              .collection("users")
              .insertOne(
                { name, surname, grade, role, department, password, username },
                function (err2, res2) {
                  if (err2) throw err2;

                  res.send("user added");

                  db.close();
                }
              );
          } else {
            res.send("Invalid");
          }
        }
      });
  });
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
      .catch((error) => res.send("an error occured! ", error));
  });
});

app.post("/admin/createLessons", jsonParser, function (req, res) {
  client.connect(function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");
    var myobj = req.body;
    let lessons = {
      lessonName: lessonName,
      ACTS: ACTS,
      lessonCode: lessonCode,
      lessonGrade: lessonGrade,
    };

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
  const { token } = req.body;

  var decoded = jwt.verify(token, process.env.JWT_KEY);

  client.connect(function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");

    dbo
      .collection("users")
      .findOne({ _id: ObjectId(decoded._id) })
      .then((item) => {
        res.send(item);
      });
  });
});

app.post("/student/updateProfile", jsonParser, function (req, res) {
  const name = req.body.name;
  let updatedData = {
    name: req.body.name,
    surname: req.body.surname,
  };
  client.connect(function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");
    dbo
      .collection("users")
      .findOneAndUpdate({ name: name }, { $set: updatedData })
      .then(() => {
        res.send("student updated successfully");
      })
      .catch((error) => res.send("an error occured! ", error));
  });
});

app.get("/student/getLessons", async function (req, err) {
  await client.connect(async function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");

    all.forEach((element) => {
      console.log(element._id, element.name);
    });
    await dbo
      .collection("lessons")
      .find({})
      .toArray()
      .then((item) => {
        res.send(item);
      });
  });
});

app.post("/student/addLessons", jsonParser, function (req, err) {
  client.connect(function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");
    var myobj = req.body;

    dbo
      .collection("studentCurrentLessons")
      .insertOne(myobj, function (err2, res2) {
        if (err2) throw err2;

        console.log("1 lesson inserted");

        db.close();
      });
  });

  res.send("success lesson inserted");
});

app.post("/student/breakLessons", jsonParser, function (req, err) {
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
      .catch((error) => res.send("an error occured! ", error));
  });
});

//gettranscript
app.get("/student/getTranscript", async function (req, err) {

  await client.connect(async function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");

    all.forEach((element) => {
      console.log(element._id, element.name);
    });
    await dbo
      .collection("transcript")
      .find({})
      .toArray()
      .then((item) => {
        res.send(item);
      });
  });

});

// getabsenteeism (yoklama)
app.get("/student/getAbsenteeism", function (req, err) {

});

//add community info topluluk adi, ogrenci
app.post("/student/addCommunity", jsonParser, function (req, err) {
  client.connect(function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");
    var myobj = req.body;

    dbo
      .collection("studentCommunities")
      .insertOne(myobj, function (err2, res2) {
        if (err2) throw err2;

        console.log("1 community inserted");

        db.close();
      });
  });

  res.send("success community inserted");
});

//get community info
app.get("/student/getCommuntiyInfo", function (req, err) {
  const { token } = req.body;

  var decoded = jwt.verify(token, process.env.JWT_KEY);

  client.connect(function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");

    dbo
      .collection("studentCommunities")
      .findOne({ _id: ObjectId(decoded._id) })
      .then((item) => {
        res.send(item);
      });
  });
});

//add Application (basvuru cap/yan dal) bolum ad, userid, basvurulacak sey
app.post("/student/addApplication", jsonParser, function (req, err) {
  client.connect(function (err, db) {

    if (err) throw err;

    var dbo = db.db("dist-proj");
    var myobj = req.body;

    dbo
      .collection("studentApplications")
      .insertOne(myobj, function (err2, res2) {
        if (err2) throw err2;

        console.log("1 appliation inserted");

        db.close();
      });
  });

  res.send("success application inserted");
});

app.listen(3000, function () {
  console.log("Server Started 3000 test çalışıyor");
});
