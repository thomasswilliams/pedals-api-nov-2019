
import express from 'express';
// dotenv https://www.npmjs.com/package/dotenv
// "Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env"
import dotenv from 'dotenv';
// apicache https://www.npmjs.com/package/apicache
// "A simple API response caching middleware for Express/Node using plain-english durations"
import apicache from 'apicache';
// rate limiter for Express routes https://www.npmjs.com/package/express-rate-limit
import rateLimiter from 'express-rate-limit';
// CORS HTTP headers https://www.npmjs.com/package/cors
import cors from 'cors';
// common security HTTP headers https://www.npmjs.com/package/helmet
import helmet from 'helmet';

// get .env file keys and values
const dot_env_result = dotenv.config();
// error if we do not get a .env file
if (dot_env_result.error) {
  throw dot_env_result.error;
}

// configure caching, needs to be applied to routes
// will add HTTP headers "apicache-store", "apicache-version"
const cache = apicache.middleware('5 minutes');

const app = express();

// ignore requests for favicon adapted from https://stackoverflow.com/a/35408810/116288
// wire up earlier, before other middleware
app.get('/favicon.ico', (req, res) => {
  // return HTTP status 204 "No content" and end the response
  return res.sendStatus(204).end();
});

// prior to defining routes, wire up rate limiter for all requests
app.enable('trust proxy');

// create new rate limiter
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const limiter = new (rateLimiter as any)({
  // timeframe is 3 seconds
  windowMs: 3 * 1000,
  // limit each IP to 5 requests per timeframe
  max: 5
});
// apply rate limiter to all requests
// also needs to be applied per route, before cache middleware
app.use(limiter);

// simple usage for CORS
// more docs at https://www.npmjs.com/package/cors
app.use(cors());
// wire up all helmet HTTP headers
app.use(helmet());

// route: get pedals collection
// rate limit route using default settings
// cache this route for 5 minutes
// return CORS and other common security HTTP headers
app.get('/pedals', limiter, cache, cors(), helmet(), (req, res) => {
  console.log('Got pedals collection');
  // hard-code JSON response
  res.send({ pedals: [{ name: 'Boss SY-1', id: 1 }] });
});

// port to listen on
const port = 34512;
// start Express server
app.listen(port, () => {
  console.log(`Express server listening at http://localhost:${port}`);
});
