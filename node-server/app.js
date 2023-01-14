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
var currentToken = "";

async function authControl(req) {
  // kullanıcı var mı? varsa json olarak verilerini dön. yoksa hata dön.
  // req içinden headerlara ulaşıyoruz ve oradan token ı alıyoruz.

  const token = req.headers["authorization"];
  try {
    var decoded = jwt.verify(
      token.substring(7, token.length),
      process.env.JWT_KEY
    );
  } catch (error) {
    return error;
  }

  await client.connect();

  return await client
    .db("dist-proj")
    .collection("users")
    .findOne({ _id: ObjectId(decoded._id) })
    .then((response) => {
      if (!response || response === null) {
        var respo = "usernotfound";
        return respo;
      } else {
        return response;
      }
    });
}

//need auth
app.post("/login", jsonParser, async function (req, res) {
  client.connect(function (err, db) {
    if (err) throw err;
    var dbo = db.db("dist-proj");
    dbo
      .collection("users")
      .findOne({ username: req.body.username })
      .then((response) => {
        if (!response || response === null) {
          res.send("User not found.");
        } else if (
          response.username === req.body.username &&
          response.password === req.body.password
        ) {
          delete response.password;
          const accessToken = jwt.sign(
            { username: req?.body?.username, _id: response?._id },
            process.env.JWT_KEY
          );
          res.send({
            response,
            token: jwt.sign(
              { username: req?.body?.username, _id: response?._id },
              process.env.JWT_KEY
            ),
          });
          currentToken = accessToken;
          res.json({ accessToken: accessToken });
        } else {
          res.send("Wrong password");
        }
      });
  });
  console.log("current token", currentToken);
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
  res.send(await authControl(req));
});

//ok
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

//ok auth?
app.post("/admin/createStudent", jsonParser, function (req, res) {
  const { name, surname, grade, role, department, password, username } =
    req.body;
  authControl(req).then((user) => {
    if (!user._id) {
      res.send("user not found");
    } else if (user.role === "admin") {
      client.connect();
      client
        .db("dist-proj")
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
      res.send("Admin role required.");
    }
  });
});

//ok auth ?
app.post("/admin/deleteStudent", jsonParser, function (req, res) {
  authControl(req).then((user) => {
    if (!user._id) {
      res.send("user not found");
    } else if (user.role === "admin") {
      client.connect();
      client
        .db("dist-proj")
        .collection("users")
        .findOneAndDelete({ _id: ObjectId(req.body._id) })
        .then(() => {
          res.send("student deleted successfully");
        })
        .catch((error) => res.send("an error occured! ", error));
    }
  });
});

//ok auth ?
app.post("/admin/createLessons", jsonParser, function (req, res) {
  client.connect(function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");
    var myobj = req.body;

    let lessons = {
      lessonName: req.body.lessonName,
      ACTS: req.body.acts,
      lessonCode: req.body.lessonCode,
      lessonGrade: req.body.lessonGrade,
    };

    dbo.collection("lessons").insertOne(lessons, function (err2, res2) {
      if (err2) throw err2;

      console.log("1 lesson inserted");

      db.close();
    });
  });

  res.send("success");
});

//get student profile auth ok
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

//ok auth ekleyeceğiz, student vs admin
app.post("/student/updateProfile", jsonParser, function (req, res) {
  const { token } = req.body;
  var decoded = jwt.verify(token, process.env.JWT_KEY);

  // özellikler genişletilecek
  let updatedData = {
    name: req.body.name,
    surname: req.body.surname,
    password: req.body.password,
  };

  client.connect(function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");
    dbo
      .collection("users")
      .findOneAndUpdate({ _id: ObjectId(decoded._id) }, { $set: updatedData })
      .then(() => {
        res.send("student updated successfully");
      })
      .catch((error) => res.send("an error occured! ", error));
  });
});

//OK
app.get("/student/getLessons", async function (req, res) {
  await client.connect(async function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");

    await dbo
      .collection("lessons")
      .find({})
      .toArray()
      .then((item) => {
        res.send(item);
      });
  });
});

//token yok ama bodyde ne varsa ekliyor auth gerekli !
app.post("/student/addLessons", jsonParser, function (req, res) {
  client.connect(function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");

    //student can select lesson with username and id,
    const { lessonCode } = req.body;
    const token = req.headers["authorization"];

    try {
      var decoded = jwt.verify(
        token.substring(7, token.length),
        process.env.JWT_KEY
      );
    } catch (error) {
      res.send("Invalid Token");
      return;
    }

    dbo
      .collection("users")
      .findOne({ _id: ObjectId(decoded._id) })
      .then((user) => {
        if (user) {
          dbo
            .collection("studentCurrentLessons")
            .insertOne(
              { lessonCode, studentId: decoded._id },
              function (err2, res2) {
                if (err2) throw err2;

                res.send("Lesson added.");

                db.close();
              }
            );
        } else {
          res.send("Token expired.");
        }
      });
  });
});

app.post("/student/breakLessons", jsonParser, function (req, res) {
  const { lessonCode } = req.body;

  authControl(req).then((user) => {
    if (!user._id) {
      res.send("user not found");
    } else if (user.role === "admin") {
      client.connect();
      client
        .db("dist-proj")
        .collection("studentCurrentLessons")
        .findOneAndDelete({ lessonCode: lessonCode, studentId: user._id })
        .then((item) => {
          res.send("student deleted successfully");
        })
        .catch((error) => res.send("an error occured! ", error));
    } else {
      res.send("Admin role required.");
    }
  });
});



//gettranscript
app.get("/student/getTranscript", async function (req, res) {
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

app.post("/student/addCommunity", jsonParser, function (req,res) {
  client.connect(function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");
    const{communityName } = req.body;
    const { lessonCode, token} = req.body;
    var decoded = jwt.verify(token, process.env.JWT_KEY);

    var studentId=decoded._id;

    dbo
      .collection("studentCommunities")
      .insertOne({communityName : communityName, studentId : studentId}, function (err2, res2) {
        if (err2) throw err2;

        console.log("1 community inserted");

        db.close();
      });
  });

  res.send("success community inserted");
});

app.get("/student/getCommuntiyInfo", function (req, res) {
  const { token } = req.body;

  var decoded = jwt.verify(token, process.env.JWT_KEY);

  client.connect(function (err, db) {
    if (err) throw err;

    var dbo = db.db("dist-proj");

    dbo
      .collection("studentCommunities")
      .find({studentId : ObjectId(decoded._id) })
      .then((item) => {
        res.send(item);
      });
  });
});

app.listen(3000, function () {
  console.log("Server Started 3000 test çalışıyor");
});
