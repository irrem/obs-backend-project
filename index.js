const express = require("express");
const app= express();
const port= process.env.PORT || 8080


//console.log("test")
app.listen(port,()=>{
    console.log("hey sea")
})