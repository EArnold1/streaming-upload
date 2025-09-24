# Streaming File Upload Server

This project demonstrates a simple Node.js server and client-side web interface for uploading large files in chunks using HTTP streaming. It supports two upload endpoints: a basic `/upload` and an improved `/v2/upload` with chunked uploads and pause/resume functionality.

---

## Table of Contents

- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
  - [Server-Side](#server-side)
    - [Basic Upload (`/upload`)](#basic-upload-upload)
    - [Chunked Upload (`/v2/upload`)](#chunked-upload-v2upload)
  - [Client-Side](#client-side)
    - [Basic Upload UI](#basic-upload-ui)
    - [Chunked Upload UI](#chunked-upload-ui)
- [Running the Project](#running-the-project)
- [Customizing Chunk Size](#customizing-chunk-size)
- [Temporary Storage](#temporary-storage)
- [Error Handling](#error-handling)
- [Development](#development)
- [License](#license)

---

## Project Structure

```
.
├── .gitignore
├── index.js
├── nodemon.json
├── package.json
├── public/
│   ├── index.html
│   ├── upload.html
│   └── upload-v2.html
└── tmp/
    └── uploads/
```

- **index.js**: Main Node.js server file.
- **public/index.html**: Introduction Page.
- **public/upload.html**: Chunked upload UI (1KB chunks, no pause/resume).
- **public/upload-v2.html**: Advanced chunked upload UI (pause/resume, chunk size selection).
- **tmp/**: Temporary storage for uploaded files.

---

## How It Works

### Server-Side

Implemented in [`index.js`](index.js):

- Serves `public/index.html` at `/`

#### Basic Upload (`/upload`)

- Receives file data in chunks via POST requests.
- Temporarily stores chunks in memory (`storage` object).
- When the last chunk is received (indicated by `content-length: 0`), concatenates all chunks and writes the file to `tmp/`.
- Clears memory storage for the file.
- Serves and `public/upload.html` at `/upload` (GET).

#### Chunked Upload (`/v2/upload`)

- Receives each chunk via POST requests and immediately appends it to a file in `tmp/uploads/` using a write stream.
- Supports large files without loading them entirely into memory.
- Handles backpressure: pauses reading from the request if the write stream buffer is full, and resumes when drained.
- No explicit end-of-file marker; the client simply stops sending chunks when done.
- Serves `public/upload-v2.html` at `/v2/upload` (GET).

### Client-Side

#### Basic Upload UI

- [`public/upload.html`](http://localhost:8001/upload)
- User selects a file and clicks "submit".
- The file is read as an ArrayBuffer and split into 1KB chunks.
- Each chunk is sent sequentially to `/upload` as a POST request with headers:
  - `content-type: application/octet-stream`
  - `content-length`: chunk size
  - `file-name`: unique file name
- Progress is displayed as a percentage.

#### Advanced Upload UI

- [`public/upload-v2.html`](http://localhost:8001/v2/upload): Advanced chunked upload with pause/resume and chunk size selection.
- User selects a file, optionally chooses a chunk size, and submits.
- The file is read as an ArrayBuffer and split into chunks of the selected size.
- Each chunk is sent sequentially to `/v2/upload` as a POST request with headers:
  - `content-type: application/octet-stream`
  - `content-length`: chunk size
  - `file-name`: unique file name
- Progress is displayed as a percentage.
- User can pause/resume the upload at any time using the "pause"/"resume" button.

---

## Running the Project

1. **Install dependencies** (only `nodemon` for development):

   ```sh
   npm install
   ```

2. **Start the server**:

   ```sh
   npm run dev
   ```

   The server listens on [http://localhost:8001](http://localhost:8001).

3. **Open the client UI**:

   - Info page: [http://localhost:8001/](http://localhost:8001/)
   - For chunked upload (no pause/resume): [http://localhost:8001/upload](http://localhost:8001/upload)
   - For advanced chunked upload (pause/resume): [http://localhost:8001/v2/upload](http://localhost:8001/v2/upload)

---

## Temporary Storage

- Uploaded files are saved in the `tmp/` directory:
  - `/upload` endpoint: files saved directly in `tmp/`
  - `/v2/upload` endpoint: files saved in `tmp/uploads/`
- The `.gitignore` file ensures that `tmp/` and its contents are not committed to version control.

---

## Development

- Uses [`nodemon`](https://www.npmjs.com/package/nodemon) for automatic server restarts on file changes.
- Configuration is in [`nodemon.json`](nodemon.json).

---
