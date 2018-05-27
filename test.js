var app = require("node-server-screenshot");
app.fromURL("https://www.baidu.com", "test.png", function(){
    //an image of google.com has been saved at ./test.png
});