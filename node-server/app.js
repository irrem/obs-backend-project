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

app.post("/login", jsonParser, async function (req, res) {
  client.connect(function (err, db) {
    if (err) throw err;
   client
   .db("dist-proj")
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

    client
    .db("dist-proj")
    .collection("users").insertOne(
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

app.get("/admin/getStudents", async function (req, res) {
 await authControl(req).then((user) => {
    if (!user._id) {
      res.send("User not found");
    } else if (user.role === "admin") {
      client.connect(async function (err, db) {
        if (err) throw err;
        
        await client
        .db("dist-proj")
          .collection("users")
          .find({})
          .toArray()
          .then((item) => {
            res.send(item);
          });
      });
    }else{
      res.send("Invalid , Admin role required");
    }
  });
});

app.post("/admin/createStudent", jsonParser, function (req, res) {
  const { name, surname, grade, role, department, password, username } =req.body;
  authControl(req).then((user) => {
    if (!user._id) {
      res.send("user not found");
    } else if (user.role === "admin") {
      client.connect();
      var checkUser= client
      .db("dist-proj")
      .collection("users")
      .findOne({username:username}).then((item)=>{
        if(!item){
          client
          .db("dist-proj")
          .collection("users")
          .insertOne(
            { name, surname, grade, role, department, password, username },
            function (err2, res2) {
              if (err2) throw err2;
              res.send("user added");
            }
          );
        }
        else{
          res.send("User already exist !");
        }
      }
      )

    } else {
      res.send("Admin role required.");
    }
  });
});

app.post("/admin/deleteStudent", jsonParser, function (req, res) {
 try {
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
    } else {
      res.send("Admin role required.");
    }
  });
 } catch (error) {
  res.send(error);
 }
});

//lessonName,lessonCode,ACTS,lessonGrade
app.post("/admin/createLessons", jsonParser, async function (req, res) {

  const {lessonName,lessonCode,ACTS,lessonGrade}=req.body; 
  await authControl(req).then((user) => {
    if (!user._id) {
      res.send("user not found");
    } else if (user.role === "admin") {
      client.connect(function (err, db) {
        if (err) throw err;
        client
        .db("dist-proj")
        .collection("lessons")
        .insertOne({lessonName,lessonCode,ACTS,lessonGrade}, function (err2, res2) {
          if (err2) throw err2;

          console.log("1 lesson inserted");

          db.close();
        });
      });
    } else {
      res.send("Admin role required.");
    }
  });
  res.send("success");
});

app.post("/student/getProfile", jsonParser, async function (req, res) {
  await authControl(req).then((user) => {
    if (!user._id) {
      res.send("user not found");
    } else if (user.role === "student") {
      client.connect(function (err, db) {
        if (err) throw err;

        client
        .db("dist-proj")
          .collection("users")
          .findOne({ _id: ObjectId(user._id) })
          .then((item) => {
            res.send(item);
          });
      });
    } else {
      res.send("Student role required.");
    }
  });
});

//parameters ? 
app.post("/student/updateProfile", jsonParser, async function (req, res) {
 
  // özellikler genişletilecek
  let updatedData = {
    name: req.body.name,
    surname: req.body.surname,
    password: req.body.password,
  };

  await authControl(req).then((user) => {
    if (!user._id) {
      res.send("user not found");
    } else if (user.role === "student") {
      client.connect(function (err, db) {
        if (err) throw err;
    
        client
        .db("dist-proj")
          .collection("users")
          .findOneAndUpdate({ _id: ObjectId(user._id) }, { $set: updatedData })
          .then(() => {
            res.send("student updated successfully");
          })
          .catch((error) => res.send("an error occured! ", error));
      });
    } else {
      res.send("Student role required.");
    }
  });
 
});

//for selectlist, get all lessons
app.get("/student/getLessons", async function (req, res) {
  await authControl(req).then((user) => {
    if (!user._id) {
      res.send("user not found");
    } else if (user.role === "student") {
       client.connect(async function (err, db) {
        if (err) throw err;
    
        await client
        .db("dist-proj")
          .collection("lessons")
          .find({})
          .toArray()
          .then((item) => {
            res.send(item);
          });
      });
    } else {
      res.send("Student role required.");
    }
  }); 
});

//lessoncode ile ders kayıt
app.post("/student/addLessons", jsonParser, async function (req, res) {
   await authControl(req).then((user) => {
    if (!user._id) {
      res.send("user not found");
    } else if (user.role === "student") {
      client.connect(function (err, db) {
        if (err) throw err;
      //student can select lesson with username and id,
        const { lessonCode } = req.body;
        
        client
        .db("dist-proj")
          .collection("users")
          .findOne({ _id: ObjectId(user._id) })
          .then((user) => {
            if (user) {
              client
              .db("dist-proj")
                .collection("studentCurrentLessons")
                .insertOne(
                  { lessonCode, studentId: user._id },
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
    } else {
      res.send("Student role required.");
    }
  });
 
});

app.get("/student/getCurrentLessons", async function (req, res) {
  await authControl(req).then((user) => {
    if (!user._id) {
      res.send("user not found");
    } else if (user.role === "student") {
       client.connect(async function (err, db) {
        if (err) throw err;
    
        await client
        .db("dist-proj")
          .collection("studentCurrentLessons")
          .find({studentId: user._id })
          .toArray()
          .then((item) => {
            res.send(item);
          });
      });
    } else {
      res.send("Student role required.");
    }
  }); 
});
//lessoncode ve userid ile ders silme
app.post("/student/breakLessons", jsonParser, function (req, res) {
  const { lessonCode } = req.body;
  
  authControl(req).then((user) => {
    if (!user._id) {
      res.send("user not found");
    } else if (user.role === "student") {
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
      res.send("Student role required.");
    }
  });
});


app.post("/student/addCommunity", jsonParser, async function (req,res) {
  const{communityName } = req.body;
  await authControl(req).then((user) => {
    if (!user._id) {
      res.send("user not found");
    } else if (user.role === "student") {
      client.connect(function (err, db) {
        if (err) throw err;
        client
        .db("dist-proj")
          .collection("studentCommunities")
          .insertOne({communityName : communityName, studentId : studentId}, function (err2, res2) {
            if (err2) throw err2;
    
            console.log("1 community inserted");
            res.send("success community inserted");
            db.close();
          });
      });
    } else {
      res.send("Student role required.");
    }
  });
});

app.get("/student/getCommuntiyInfo", async function (req, res) {
 await authControl(req).then((user) => {
    if (!user._id) {
      res.send("user not found");
    } else if (user.role === "student") {
      client.connect(function (err, db) {
        if (err) throw err;
         client
         .db("dist-proj")
          .collection("studentCommunities")
          .find({studentId : ObjectId(decoded._id) })
          .then((item) => {
            res.send(item);
          });
      });
    } else {
      res.send("Student role required.");
    }
  });
});

app.listen(3000, function () {
  console.log("Server Started 3000 test çalışıyor");
});
