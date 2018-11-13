const redisfile = require('redis');
let redis_client;

if (process.env.REDISCLOUD_URL) {
    redis_client = redisfile.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});
} else {
    redis_client = redisfile.createClient();
}

redis_client.on('connection', () => {
    console.log('Redis: Client connected');
});

redis_client.on('error', (err) => {
    console.log('Redis: Something went wrong:', err);
});

module.exports = redis_client;