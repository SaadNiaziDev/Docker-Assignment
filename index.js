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
  }, 1000);

app.get("/primeNumber/:start/:end", (req, res) => {
  try {
    var f = fs.createWriteStream("data.txt");

    let start = req.params.start;
    let end = req.params.end;
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
    
    f.on("error", function (err) {
      console.log(err);
    });
    arr.forEach(function (v) {
      f.write(v + "\n");
    });
    f.end();
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

app.get("/usage/:time", (req, res) => {
  try {
    let obj={
      cpu_usage:0,
      mem_usage:0,
    };
    let sum=0,add=0;
    var memArr=[];
    var cpuArr=[];
    let current = Date.now();
    let start = new Date-req.params.time*60*1000;
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
         obj.cpu_usage=sum/cpuArr.length;
         obj.mem_usage=add/cpuArr.length;
        res.send({body:obj});
    });
  } catch (err) {
    res.send(err.message).statusCode(404);
  }
});

app.listen(3000, () => {
  console.log("listening on port " + 3000);
});
