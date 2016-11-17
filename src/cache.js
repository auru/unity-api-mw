import { uri } from 'unity-utils';

function createRegistry(resources) {
    return Object.keys(resources).reduce((result, resourceId) => {
        result[resourceId] = [].concat(
            [].concat(resources[resourceId]).map(item => item.method)
        );
        return result;
    }, {});
}

function isInRegistry(registry, resourceId, method) {
    return registry[resourceId] && registry[resourceId].includes(method);
}

function paramsToString(params = {}) {
    return Object.keys(params).sort().reduce((result, paramKey) => {
        result.push(paramKey + '=' + [].concat(params[paramKey]).sort().map(String).join());
        return result;
    }, []).join('&');
}

function createCacheKey(resourceId, method, params) {

    const { path, query = {}, options = {} } = params;
    const pathPart = uri.join(...[].concat(path));
    const result = [ resourceId, method, pathPart, paramsToString(query), paramsToString(options) ].filter(Boolean);

    return result.join(':');
}

export default function cacheMw(settings = {}) {

    const { cache, bin = 'api', expire = Number.MAX_SAFE_INTEGER, resources = {} } = settings;

    const registry = createRegistry(resources);

    return next => async(options, params, resourceId, method) => {

        if (!isInRegistry(registry, resourceId, method) || !cache) return await next();

        const cacheKey = createCacheKey(resourceId, method, params);

        const cachedResult = await cache.get(bin, cacheKey);

        if (cachedResult) return cachedResult;

        const result = await next();

        if (result instanceof Error) return result;

        const methodExpire = resources[resourceId].filter(item => item.method === method).pop().expire;

        const cacheExpire = methodExpire === undefined ? expire : methodExpire;

        await cache.set(bin, cacheKey, result, cacheExpire);

        return result;
    };
}
