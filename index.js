const express = require("express");
const fs = require("fs");
const os = require("os");
var osu = require('node-os-utils')
const csvtojson = require('csvtojson');
var cpu = osu.cpu;
var mem = osu.mem;
const app = express();
app.use(express.static("./public"));
app.use(express.json());

var file = fs.createWriteStream("time.csv");
file.write("TIME"+","+"CPU%"+","+"MEMORY% \n");

setInterval( () => {
  cpu.usage()
  .then(data => {
    mem.info()
  .then(info => {
    
    fs.appendFile("time.csv",(Date.now()+","+data.toFixed(2)+"%"+","+((100-info.freeMemPercentage).toFixed(2))+"%"+'\n'),err=>{})
  })
    
  })
  }, 5000);

app.post("/primeNumber", (req, res) => {
  try {
    let start = req.body.start;
    let end = req.body.end;
    var arr = [];

    for (let i = start; i <= end; i++) {
      let flag = 0;

      for (let j = 2; j < i; j++) {
        if (i % j == 0) {
          flag = 1;
          break;
        }
      }

      if (i > 1 && flag == 0) {
        arr.push(i);
      }
    }
    
    file.on("error", function (err) {
      console.log(err);
    });
    arr.forEach(function (v) {
      file.write(v + "\n");
    });
    file.end();
    res.send("File has been successfully written");
  } catch (err) {
    res.send(err.message).statusCode(404);
  }
});

app.get("/getPrime", (req, res) => {
  try {
    fs.readFile("data.txt", "utf8", (err, success) => {
      if (err && !success) {
        res.send(err.message).statusCode(404);
      } else if (!err && success) {
        res.send(success).statusCode(200);
      }
    });
  } catch (err) {
    res.send(err.message).statusCode(404);
  }
});

app.post("/usage", (req, res) => {
  try {
    let obj={
      a:0,
      b:0
    };
    let sum=0,add=0;
    var memArr=[];
    var cpuArr=[];
    let current = Date.now();
    let start = new Date-req.body.time*60*1000;
    csvtojson()
    .fromFile('time.csv')
    .then(async(source) =>  {
        for (let i=0; i < source.length; i++) {
             var oneRow = {
                 Time : source[i]['TIME'],
                 CPU: source[i]['CPU%'],
                 MEM: source[i]['MEMORY%']
             };
             if(oneRow.Time>start && oneRow.Time<current){
              cpuArr.push(parseInt(oneRow.CPU));
              memArr.push(parseInt(oneRow.MEM));
             }
         }
         for(let i=0; i<cpuArr.length; i++){
          sum=sum+cpuArr[i];
          add=add+memArr[i];
         }
         obj.a=sum/cpuArr.length;
         obj.b=add/cpuArr.length;
        res.send({body:obj});
    });
  } catch (err) {
    res.send(err.message).statusCode(404);
  }
});

app.listen(3000, () => {
  console.log("listening on port " + 3000);
});
