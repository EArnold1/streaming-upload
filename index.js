const http = require('http');
const fs = require('fs');
const { Buffer } = require('node:buffer');
const httpServer = http.createServer();
const { mkdir } = require('node:fs');
const path = require('path');

// memory storage
let storage = {};

httpServer.on('listening', () => console.log('listening'));

httpServer.on('request', (req, res) => {
  if (req.url === '/') {
    return res.end(fs.readFileSync('index.html'));
  }

  if (req.url === '/upload') {
    const fileName = req.headers['file-name'];
    if (!storage[fileName]) {
      storage[fileName] = [];
    } // create empty entry

    const contentLength = req.headers['content-length'];
    req.on('data', (chunk) => {
      storage[fileName].push(chunk); // append chunk
    });

    req.on('end', () => {
      if (!+contentLength) {
        mkdir('./tmp', { recursive: true }, (err) => {
          if (err) throw err;
        }); // create folder

        fs.writeFileSync(
          path.join('tmp', fileName),
          Buffer.concat(storage[fileName])
        ); //  write file

        storage[fileName] = []; // clear storage
        console.log('upload completed');
      }
      res.end();
    });
  }
});

httpServer.listen(8001);
