import test from 'ava';
import sinon from 'sinon';

import retry from '../../src/retry';
import APIError from 'unity-api/dist/error';

const APIStub = async val => val;
const APIStubError404 = APIStub.bind(null, new APIError(404));
const APIStubError500 = APIStub.bind(null, new APIError(500));
const APIStubError600 = APIStub.bind(null, new APIError(600));
const APIStubNormal = APIStub.bind(null, {});

test('normal api response', async t => {
    const stub = sinon.spy(APIStubNormal);
    const mw = retry()(stub);
    await mw();
    t.true(stub.calledOnce);
});

test('error 404 api response with defaults', async t => {
    const stub = sinon.spy(APIStubError404);
    const mw = retry()(stub);
    await mw();
    t.true(stub.calledOnce);
});

test('error 500 api response with defaults', async t => {
    const stub = sinon.spy(APIStubError500);
    const mw = retry()(stub);
    await mw();
    t.true(stub.calledOnce);
});

test('error 600 api response with defaults', async t => {
    const stub = sinon.spy(APIStubError600);
    const mw = retry()(stub);
    await mw();
    t.true(stub.calledOnce);
});

test('error 500 api response with wrong predefined count setting', async t => {
    const stub = sinon.spy(APIStubError500);
    const mw = retry({ key: 'whatever', count: 'count' })(stub);
    await mw();
    t.true(stub.calledOnce);
});

test('error 500 api response with wrong predefined key setting', async t => {
    const stub = sinon.spy(APIStubError500);
    const mw = retry({ key: 'whatever', count: 'count' })(stub);
    await mw({key: 'test'});
    t.true(stub.calledOnce);
});

test('error 404 api response with predefined settings', async t => {
    const stub = sinon.spy(APIStubError404);
    const mw = retry({ key: 'whatever', count: 2 })(stub);
    await mw();
    t.true(stub.calledOnce);
});

test('error 500 api response with predefined settings', async t => {
    const stub = sinon.spy(APIStubError500);
    const mw = retry({ key: 'whatever', count: 2 })(stub);
    await mw();
    t.true(stub.calledThrice);
});

test('error 600 api response with predefined settings', async t => {
    const stub = sinon.spy(APIStubError600);
    const mw = retry({ key: 'whatever', count: 2 })(stub);
    await mw();
    t.true(stub.calledOnce);
});

test('error 404 api response with overridden count 0', async t => {
    const stub = sinon.spy(APIStubError404);
    const mw = retry({ key: 'whatever', count: 2 })(stub);
    await mw({ whatever: 0 });
    t.true(stub.calledOnce);
});

test('error 500 api response with overridden count 0', async t => {
    const stub = sinon.spy(APIStubError500);
    const mw = retry({ key: 'whatever', count: 2 })(stub);
    await mw({ whatever: 0 });
    t.true(stub.calledOnce);
});

test('error 600 api response with overridden count 0', async t => {
    const stub = sinon.spy(APIStubError600);
    const mw = retry({ key: 'whatever', count: 2 })(stub);
    await mw({ whatever: 0 });
    t.true(stub.calledOnce);
});

test('error 404 api response with overridden key and count 1', async t => {
    const stub = sinon.spy(APIStubError404);
    const mw = retry({ key: 'whatever', count: 3 })(stub);
    await mw({ whatever: 1 });
    t.true(stub.calledOnce);
});

test('error 500 api response with overridden key and count 1', async t => {
    const stub = sinon.spy(APIStubError500);
    const mw = retry({ key: 'whatever', count: 3 })(stub);
    await mw({ whatever: 1 });
    t.true(stub.calledTwice);
});

test('error 600 api response with overridden key and count 1', async t => {
    const stub = sinon.spy(APIStubError600);
    const mw = retry({ key: 'whatever', count: 3 })(stub);
    await mw({ whatever: 1 });
    t.true(stub.calledOnce);
});