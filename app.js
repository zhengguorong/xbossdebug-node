let express = require("express");
let app = express();
let port = 8090;
let fs = require("fs");
let fsExtra = require("fs-extra");
let path = require("path");
let moment = require("moment");
let accessDir = "/Users/zhengguorong/project/feature/xbossdebug-node/jslogs/";
let accessPath = accessDir + "jserror.access.log";
let logpath = path.resolve(__dirname, accessPath);
let async = require("async");

fsExtra.ensureDirSync(accessDir);

var rotatingLogStream = require("file-stream-rotator").getStream({
  filename: accessPath,
  frequency: "1h",
  verbose: false,
  max_logs: "5d",
  audit_file:
    "/Users/zhengguorong/project/feature/xbossdebug-node/jslogs/log-audit.json"
});

var msgFormat = function(err_msg) {
  let logs = [];
  let errmsg = decodeURIComponent(err_msg);
  let errLogs = errmsg.split("|");
  errLogs = errLogs.map(msg => {
    let params = {};
    msg = msg.replace(/\^/g, "&");
    msg = msg.split("&");
    msg.forEach(item => {
      item = item.split("=");
      params[item[0]] = item[1];
    });
    params["log_master"] = params["msg"] ?  "log" : "perf";
    return params;
  });
  return errLogs;
};

app.get("/read.gif", (req, res, next) => {
  let img = fs.createReadStream(path.resolve(__dirname, "./images/read.gif"));
  var err_msg = req.query.err_msg;
  var perf_msg = req.query.perf_msg;
  var project_name = req.query.project_name;
  var key = req.query.key;
  if (err_msg || perf_msg) {
    let errLogs = msgFormat(err_msg || perf_msg);
    let writelogs = [];
    errLogs.forEach(params => {
      let log = {
        project_name: project_name,
        key: key,
        "@timestamp": moment().format(),
        request_time: moment().format("YYYY-MM-DD hh:mm:ss"),
        message: {
          ...params
        }
      };
      log = "@cee: " + JSON.stringify(log) + "\n";
      console.log(log);
      writelogs.push(function(cb) {
        rotatingLogStream.write(log + "\n", cb);
      });
    });
    //写入日志
    async.parallel(writelogs);
  }
  img.pipe(res);
});

app.use((req, res, next) => {
  res.status(404);
  res.send("404: File Not Found");
});

app.listen(port);
console.log("the server is listen on %s", port);
