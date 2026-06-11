const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8000;
const experimentDir = path.join(__dirname, "experiment");
const trellisDir = path.join(__dirname, "experiment-trellis");
const trellisDataDir = path.join(__dirname, "experiment-trellis", "data", "participants");

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
    ".svg": "image/svg+xml",
};

const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);

    // POST /api/save — store participant data
    if (req.method === "POST" && urlPath === "/api/save") {
        let body = "";
        req.on("data", function (chunk) { body += chunk; });
        req.on("end", function () {
            try {
                var data = JSON.parse(body);
                var pid = data.participant_id || ("P" + Date.now());
                var filePath = path.join(trellisDataDir, pid + ".json");
                if (!filePath.startsWith(trellisDataDir)) {
                    res.writeHead(403);
                    res.end("Forbidden");
                    return;
                }
                fs.mkdirSync(trellisDataDir, { recursive: true });
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "ok", participant_id: pid }));
            } catch (e) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "error", message: e.message }));
            }
        });
        return;
    }

    if (urlPath === "/") urlPath = "/index.html";

    let filePath;

    if (urlPath.startsWith("/experiment-trellis/")) {
        filePath = path.join(trellisDir, urlPath.slice("/experiment-trellis/".length));
        if (!filePath.startsWith(trellisDir)) {
            res.writeHead(403);
            res.end();
            return;
        }
    } else if (urlPath.startsWith("/jspsych-mouselab-mdp/")) {
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
