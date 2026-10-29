const NodeCache = require("node-cache");

const cache = new NodeCache({
  stdTTL: Number(process.env.CACHE_TTL_SECONDS) || 30,
  checkperiod: 60
});

function invalidateTaskCaches() {
  cache.keys().forEach((key) => {
    if (key.startsWith("tasks:")) cache.del(key);
  });
}

module.exports = { cache, invalidateTaskCaches };
