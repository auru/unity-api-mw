# Unity API Middleware

[![Travis-CI](https://api.travis-ci.org/auru/unity-api-mw.svg?branch=master)](https://travis-ci.org/auru/unity-api-mw)
[![Coverage Status](https://coveralls.io/repos/github/auru/unity-api-mw/badge.svg?branch=master)](https://coveralls.io/github/auru/unity-api-mw?branch=master)
[![npm version](https://badge.fury.io/js/unity-api-mw.svg)](https://badge.fury.io/js/unity-api-mw)
[![Scrutinizer](https://scrutinizer-ci.com/g/auru/unity-api-mw/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/auru/unity-api-mw/)
[![Deps](https://david-dm.org/auru/unity-api-mw/status.svg)](https://david-dm.org/auru/unity-api-mw)
[![Deps-Dev](https://david-dm.org/auru/unity-api-mw/dev-status.svg)](https://david-dm.org/auru/unity-api-mw)
[![Dependency Status](https://dependencyci.com/github/auru/unity-api-mw/badge)](https://dependencyci.com/github/auru/unity-api-mw)

> Collection of middleware for [unity-api](https://github.com/auru/unity-api).

# Table of Contents
  * [Installation](#installation)
  * [Usage](#usage)
  * [API](#api)
    * [retry](#retrysettings)
    * [response](#responsesettings)
    * [cache](#cachesettings)
  * [Contributing](#contributing)
  * [License](#license)

# Installation

```bash
npm i --save unity-api-mw
```
# Usage

If API has been created with [unity-api](https://github.com/auru/unity-api), then its methods can be called like this: `API[resource][method](methodParams, middlewareOptions)`. 

Even though the entire `middlewareOptions` object is available to every middleware in chain, it's best to namespace every middleware with its own key in `middlewareOptions`. That's why middleware should initially come in a form of high-order function with plain object `settings` as its argument, so that end-user can override the defaults.

# API 

## retry(settings)

If [`Response.ok`](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok) from [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) is `false`, retry the request again.

### settings {Object} *Optional*
Middleware settings.

#### key {String} *Optional*
**Default:** `'retry'`

Key in `middlewareOptions` to look up.

#### count {Number} *Optional*
**Default:** `0`

How many times middleware should attempt to re-`fetch` if it fails the first time.

> Now you can make API calls, changing the default number of retries on per-call basis:

```js
API.user.get({ id: 1 }, { retry: 2 });
```

**Example:**
```js
// api.js
import resources from './api/resources';
import createAPI from 'unity-api';
import { retry } from 'unity-api-mw'; // or import retry from 'unity-api-mw/lib/retry'

const middleware = [
  retry({ key: 'retry', count: 1 }) // retry on every fail once
]

const API = createAPI(resources, middleware, 'api');

export default API;
```

```js
// user.js
import API from './api';
API.user.get({ id: 1 }, { retry: 2 }); // get user with id 1, retry twice on fail instead of once.
```

## response(settings)

If the response option is enabled, you can get the whole [response](https://developer.mozilla.org/en-US/docs/Web/API/Response). 

### settings {Object} *Optional*
Middleware settings.

#### key {String} *Optional*
**Default:** `'response'`

Key in `middlewareOptions` to look up.

> Now you can make API calls and get the whole response:

```js
API.user.get({ id: 1 }, { response: true });
```

**Example:**
```js
// api.js
import resources from './api/resources';
import createAPI from 'unity-api';
import { response } from 'unity-api-mw'; // or import retry from 'unity-api-mw/lib/response'

const middleware = [
  response({ key: 'response' })
]

const API = createAPI(resources, middleware, 'api');

export default API;
```

```js
// user.js
import API from './api';
API.user.get({ id: 1 }, { response: true }); // get response.
API.user.get({ id: 1 }, { response: false }); // get response body.
```

## cache(settings)

Cache [unity-api](https://github.com/unity/unity-api) responses with [unity-cache](https://github.com/unity/unity-cache).

This middleware doesn't support caching on per-call basis, meaning it doesn't use anything from `middlewareOptions` parameter of the API call.

### settings {Object} *Optional*

Middleware settings.

#### cache {Instance of unity-api} *Optional*

**Default:** `undefined`

Although this parameter is *optional*, without an instance of [unity-cache](https://github.com/unity/unity-cache) this middleware is useless.

#### bin {String} *Optional*

**Default:** `'api'`

Name of the **cache bin** reserved for caching API calls in [unity-cache](https://github.com/unity/unity-cache) instance.

#### expire {Number} *Optional*

**Default:** `Number.MAX_SAFE_INTEGER` (forever)

The amount of milliseconds API calls should be cached for by default.

#### resources {Object} *Optional*

**Default:** `{}`

A hash map of [resources](https://github.com/auru/unity-api#resources-object-optional) that should be cached.

Each entry should be indicated by the resource's **key**, the same one used in setting up of [unity-api](https://github.com/unity/unity-api) instance. **Values** are `arrays` of plain `objects` with the following structure:

##### method {String}

Name of a API's resource method that should be cached.

##### expire {Number} *Optional*

**Default:** `Number.MAX_SAFE_INTEGER` (forever)

The amount of milliseconds API call to this method should be cached for.

**Example:**
```js
{
    ['user' /* key */ ]: [
        { method: 'get', expire: 1000 },
        { method: 'set', expire: 1000 },
        { method: 'delete' }
    ]
}
```

**Putting it all together:**
```js
// api.js
import createAPI from 'unity-api';
import createCache from 'unity-cache';
import { cache as cacheMw } from 'unity-api-mw'; // or import cache from 'unity-api-mw/lib/cache'

const resources = {
  user: {
    namespace: 'people',
    methods: {
      getById: ({ id }) => ({ path: ['id', id] }),
      getByName: ({ name }) => ({ path: ['name', name] }),
    }
  }
}

const apiCacheBin = 'api';
const cache = createCache([apiCacheBin]);

const middleware = [
  cacheMw(
     cache,       // cache instance created with unity-cache
     apiCacheBin, // name of the cache bin
     1000,        // cache resources for 1 second by default
     {
       user: [
         { method: 'getById', expire: 1000 * 60 }, // cache all responses from API.user.getById for 1 minute
         { method: 'getByName' }                   // cache all responses from API.user.getByName for 1 second (default)
       ]
     }
  ) 
]

const API = createAPI(resources, middleware, 'api');

export default API;
```

# Contributing

* Provide [conventional commit messages](https://github.com/conventional-changelog/conventional-changelog-angular/blob/master/convention.md) by using `npm run commit` instead of `git commit`.
* **Core contributors:** use GitHub's *Rebase and merge* as a default way of merging PRs.

# License
MIT © AuRu
