import test from 'ava';
import sinon from 'sinon';
import fetchMock from 'fetch-mock';

import cacheMW from '../../src/cache';
import createCache from 'unity-cache';
import createAPI from 'unity-api';
import APIError from 'unity-api/dist/error';

const apiResources = {
    user: {
        namespace: 'user',
        methods: {
            get: ({ id }) => ({ path: ['get', id] }),
            set: ({ id }) => ({ path: ['set', id], options: { method: 'POST' } }),
            delete: ({ id, force = true }) => ({ path: ['delete', id], query: { force }, options: { method: 'DELETE' }, method: 'json'})
        }
    }
};

const APIResponseStub = async val => val;
const APIResponseStubNormal = APIResponseStub.bind(null, {});
const APIResponseStubError500 = APIResponseStub.bind(null, new APIError(500));

const cacheService = createCache('api');

const CACHEMW_SETTINGS = {
    cache: cacheService,
    resources: {
        user: [
            { method: 'get', expire: 1000 },
            { method: 'set', expire: 1000 },
            { method: 'delete' }
        ]
    }
};

test.before('mock fetch', () => {
    fetchMock.get('/api/user/get/1', { name: 'user' });
    fetchMock.post('/api/user/set/1', { name: 'user' });
    fetchMock.delete('/api/user/delete/1?force=true', { name: 'user' });
});

test.after('unmock fetch', () => {
    fetchMock.restore();
});

test.beforeEach('create api, cache and spies', t => {
    t.context.cache = cacheMW(CACHEMW_SETTINGS);
    t.context.api = createAPI(apiResources, cacheMW(CACHEMW_SETTINGS), '/api/');
    t.context.spyCacheGet = sinon.spy(CACHEMW_SETTINGS.cache.get);
    t.context.spyCacheSet = sinon.spy(CACHEMW_SETTINGS.cache.set);
});

test.afterEach('destroy api, cache and spies', async t => {
    fetchMock.reset();
    await CACHEMW_SETTINGS.cache.remove();
    delete t.context.cache;
    delete t.context.api;
    delete t.context.spyCacheGet;
    delete t.context.spyCacheSet;
});

test('defaults', async t => {
    const apiSpy = sinon.spy(APIResponseStubNormal);
    const mw = cacheMW()(apiSpy);
    await mw();
    t.true(apiSpy.calledOnce);
});

test('defaults with cache service', async t => {
    const apiSpy = sinon.spy(APIResponseStubNormal);
    const mw = cacheMW({ cache: CACHEMW_SETTINGS.cache })(apiSpy);
    await mw();
    t.true(apiSpy.calledOnce);
    t.true(t.context.spyCacheGet.notCalled);
});

test('defaults with cache service and resources', async t => {
    const apiSpy = sinon.spy(APIResponseStubNormal);
    const mw = t.context.cache(apiSpy);
    await mw();
    t.true(apiSpy.calledOnce);
    t.true(t.context.spyCacheGet.notCalled);
});

test('api returns error', async t => {
    const apiSpy = sinon.spy(APIResponseStubError500);
    const mw = t.context.cache(apiSpy);
    await mw();
    t.true(apiSpy.calledOnce);
    t.true(t.context.spyCacheGet.notCalled);
});

test('not throws on invalid cache bin', t => {
    t.context.api = createAPI(apiResources, cacheMW({ ...CACHEMW_SETTINGS, bin: 'notExists' }), '/api/');
    const apiSpy = sinon.spy(t.context.api.user.get);
    t.notThrows(apiSpy({ id: 1 }));
});

test('uncached api call without expiration', async t => {
    const cacheKey = 'user:delete:delete/1:force=true:method=DELETE';
    const apiResult = await t.context.api.user.delete({ id: 1 });
    const cachedResult = await CACHEMW_SETTINGS.cache.get('api', cacheKey);
    const cachedResultExpire = await CACHEMW_SETTINGS.cache.get('___expire___', 'api::'+cacheKey, false);
    t.deepEqual(apiResult, cachedResult);
    t.true(cachedResultExpire >= Number.MAX_SAFE_INTEGER);
});

test('complex uncached api call with expiration', async t => {
    const cacheKey = 'user:get:get/1';
    const cachedResultBefore = await CACHEMW_SETTINGS.cache.get('api', cacheKey);
    const cachedResultExpireBefore = await CACHEMW_SETTINGS.cache.get('___expire___', 'api::'+cacheKey);
    t.is(cachedResultBefore, null, 'should be null before');
    t.is(cachedResultExpireBefore, null, 'should be null before');

    const apiResult = await t.context.api.user.get({ id: 1 });

    const cachedResultAfter = await CACHEMW_SETTINGS.cache.get('api', cacheKey);
    const cachedResultExpireAfter = await CACHEMW_SETTINGS.cache.get('___expire___', 'api::'+cacheKey, false);

    t.true(fetchMock.called('/api/user/get/1'));
    t.deepEqual(apiResult, cachedResultAfter, 'result was cached');
    t.true(cachedResultExpireAfter < Number.MAX_SAFE_INTEGER, 'should expire before forever');
    t.true(cachedResultExpireAfter > Date.now(), 'should expire after now');
});

test('cached api call', async t => {
    await t.context.api.user.set({ id: 1 });
    await t.context.api.user.set({ id: 1 });

    t.is(fetchMock.calls('/api/user/set/1').length, 1);
});
