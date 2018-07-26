import test from 'ava';
import sinon from 'sinon';

import response from '../../src/response';
import APIError from 'unity-api/dist/error';

const body = { result: 'result' };
const responseBody = { status: 200, ok: true, body };
const errorBody = new APIError();

const APIStub = async val => val;
const APIStubNormal = APIStub.bind(null, responseBody);
const APIStubError = APIStub.bind(null, errorBody);

test('return response body without option', async t => {
    const stub = sinon.spy(APIStubNormal);

    const mw = response()(stub);
    const result = await mw();

    t.deepEqual(result, body);
});

test('return full response with default option', async t => {
    const stub = sinon.spy(APIStubNormal);

    const mw = response()(stub);
    const result = await mw({ response: true });

    t.deepEqual(result, responseBody);
});

test('return full response with custom option', async t => {
    const stub = sinon.spy(APIStubNormal);

    const mw = response({ key: 'custom' })(stub);
    const result = await mw({ custom: true });

    t.deepEqual(result, responseBody);
});

test('return response body with incorrect option', async t => {
    const stub = sinon.spy(APIStubNormal);

    const mw = response({ key: 'custom' })(stub);
    const result = await mw({ incorrect: true });

    t.deepEqual(result, body);
});

test('return error with disabled otpion', async t => {
    const stub = sinon.spy(APIStubError);

    const mw = response()(stub);
    const result = await mw();

    t.deepEqual(result, errorBody);
});

test('return error with enabled otpion', async t => {
    const stub = sinon.spy(APIStubError);

    const mw = response()(stub);
    const result = await mw({ response: true });

    t.deepEqual(result, errorBody);
});
