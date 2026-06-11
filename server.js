const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8000;
const experimentDir = path.join(__dirname, "experiment");

const mimeTypes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".map": "application/json",
};

const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath === "/") urlPath = "/index.html";

    let filePath;

    if (urlPath.startsWith("/jspsych-mouselab-mdp/")) {
        filePath = path.resolve(path.join(__dirname, urlPath));
        if (!filePath.startsWith(__dirname)) {
            res.writeHead(403);
            res.end();
            return;
        }
    } else {
        filePath = path.join(experimentDir, urlPath);
        if (!filePath.startsWith(experimentDir)) {
            res.writeHead(403);
            res.end();
            return;
        }
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404);
            res.end();
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
        fs.createReadStream(filePath)
            .on("error", () => {
                res.writeHead(500);
                res.end();
            })
            .pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`http://localhost:${PORT}/`);
});

process.on("SIGINT", () => {
    server.close(() => {
        process.exit(0);
    });
});
