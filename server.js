const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes (useful if frontend is served separately during dev, 
// but strictly not needed if serving static files from same origin)
app.use(cors());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Proxy API requests
// Matches /search/* and forwards to https://api.leadlance.io/search/*
app.use('/search', createProxyMiddleware({
    target: 'https://api.leadlance.io',
    changeOrigin: true,
    pathRewrite: {
        '^/search': '/search', // rewrite path
    },
    onProxyReq: (proxyReq, req, res) => {
        // Optional: Log proxy requests for debugging
        // console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.getHeader('host')}${proxyReq.path}`);
    },
    onError: (err, req, res) => {
        console.error('[Proxy Error]', err);
        res.status(500).send('Proxy Error');
    }
}));

// Fallback for SPA (if needed, though this is a single file app)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Proxying /search/* to https://api.leadlance.io/search/*`);
});
