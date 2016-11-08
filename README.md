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
Middleware settings

#### key {String} *Optional*
**Default:** `'retry'`

Key in `middlewareOptions` to look up.

#### count {Number} *Optional*
**Default:** `0`

How many times middleware should attempt to re-`fetch` if it fails the first time.

**Example:**
```js
// api.js
import resources from './api/resources';
import createAPI from 'unity-api';
import { retry } from 'unity-api-mw'; // or import retry from 'unity-api-mw/lib/retry'

const middleware = [
  retry({ key: 'retry', count: 1 }) // retry on every fail once
]

const API = createAPI(resources, middleware, 'api', fetchOptions);

export default API;
```

```js
// user.js
import api from './api';
API.user.get({ id: 1 }, { retry: 2 }); // get user with id 1, retry twice on fail instead of once.
```

# Contributing

* Provide [conventional commit messages](https://github.com/conventional-changelog/conventional-changelog-angular/blob/master/convention.md) by using `npm run commit` instead of `git commit`.
* **Core contributors:** use GitHub's *Rebase and merge* as a default way of merging PRs.

# License
MIT © AuRu
