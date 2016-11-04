import test from 'ava';
import sinon from 'sinon';

import retry from '../../src/mw/retry';
import APIError from 'unity-api/dist/error';

const APIStub = async val => val;
const APIStubError = APIStub.bind(null, new APIError(404));
const APIStubNormal = APIStub.bind(null, {});

test('normal api response', async t => {
    const stub = sinon.spy(APIStubNormal);
    const mw = retry()(stub);
    await mw();
    t.true(stub.calledOnce);
});

test('error api response', async t => {
    const stub = sinon.spy(APIStubError);
    const mw = retry()(stub);
    await mw();
    t.true(stub.calledOnce);
});

test('error api response with predefined settings', async t => {
    const stub = sinon.spy(APIStubError);
    const mw = retry({ key: 'whatever', count: 2 })(stub);
    await mw();
    t.true(stub.calledThrice);
});

test('error api response with overridden count 0', async t => {
    const stub = sinon.spy(APIStubError);
    const mw = retry({ key: 'whatever', count: 2 })(stub);
    await mw({ whatever: 0 });
    t.true(stub.calledOnce);
});

test('error api response with overridden key and count 1', async t => {
    const stub = sinon.spy(APIStubError);
    const mw = retry({ key: 'whatever', count: 3 })(stub);
    await mw({ whatever: 1 });
    t.true(stub.calledTwice);
});