const express = require('express');
const path = require('path');
const app = express();

//ssl
const fs = require('fs');

// environment
const HTTPS = (process.env?.HTTPS ?? false) === 'true';
const PORT = process.env.PORT ?? 3000;
const SSL_KEY_FILE = process.env?.SSL_KEY_FILE ?? null;
const SSL_CRT_FILE = process.env?.SSL_CRT_FILE ?? null;

function isHTTPS() {
  return HTTPS && {
    key: fs.readFileSync(process.env.SSL_KEY_FILE),
    cert: fs.readFileSync(process.env.SSL_CRT_FILE)
  };
}

const option = isHTTPS();



// Backend Server Proxy
const proxy = require('http-proxy-middleware');
app.use(proxy('/api', {
  target: 'http://localhost:5000',
  changeOrigin: true
}));

// SPA Setting
const ROOT = process.cwd();
app.use(express.static(path.join(__dirname, 'build')));
app.get('/img/*', function (req, res) {
  const dir = req.baseUrl;
  const file = req.path;
  res.sendFile(path.join(ROOT, 'static', dir, file));
});
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// SPA Server

const server = option ? (require('https').createServer(option, app)) : (require('http').createServer({}, app));
server.listen(PORT);

/* Linux Signal */
/*
const toStop = () => {
  server.close(() => console.log('server closed.'));
};
process.on('SIGINT', toStop);
process.on('SIGHUP', toStop);
*/
