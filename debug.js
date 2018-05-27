
let express = require('express');
let app = express();
let port = 8091;

app.get('/test', (req, res, next) => {
  let startTime = new Date().getTime()
  res.status(200)
  res.send('success')
  let endTime = new Date().getTime()
  console.log(endTime - startTime)
});

app.use((req, res, next) => {
  res.status(404);
  res.send('404: File Not Found');
});


app.listen(port);
console.log('the server is listen on %s', port);