const http = require('http');
const fs = require('fs');
const { Buffer } = require('node:buffer');
const { mkdir } = require('node:fs');
const path = require('path');

// memory storage
const storage = {};

const httpServer = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(fs.readFileSync('./public/index.html'));
  }

  if (req.url === '/upload' && req.method === 'POST') {
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
        console.info('upload completed');
      }
      return res.end();
    });
  }

  if (req.url === '/v2/upload' && req.method === 'POST') {
    const fileName = req.headers['file-name'];

    const filePath = path.join(process.cwd(), 'tmp', 'uploads', fileName);

    // make sure file exists (creates the file if it doesn't exist)
    mkdir(path.dirname(filePath), { recursive: true }, (err) => {
      if (err) throw err;
    });

    const writeStream = fs.createWriteStream(filePath, { flags: 'a' }); // 'a' flag is used to create a write stream to append

    req.on('data', (chunk) => {
      if (!writeStream.write(chunk)) {
        req.pause();
      }
    });

    // The "drain" event is emitted when the internal buffer of
    // the writable stream has been emptied enough that it can accept more data.
    writeStream.on('drain', () => {
      req.resume();
    });

    writeStream.on('finish', () => {
      console.info('INFO: finish event emitted');
      writeStream.close();
    });

    req.on('end', () => {
      writeStream.end();
      console.info('INFO: upload completed');

      return res.end();
    });
  }

  if (req.url === '/v2/upload' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(fs.readFileSync('./public/upload.html'));
  }

  if (!['/', '/upload', '/v2/upload'].includes(req.url)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'resource not found' }));
  }

  return null;
});

const PORT = 8001;

httpServer.listen(PORT, () => console.info(`Server running on port ${PORT}`));
