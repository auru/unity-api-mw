import test from 'ava';
import { isAPIError } from '../../src/utils';
import APIError from 'unity-api/dist/error';

test('APIError', t => {
    t.true(isAPIError(new APIError()))
});

test('standard error', t => {
    t.false(isAPIError(Error()))
});

test('standard new error', t => {
    t.false(isAPIError(new Error()))
});

test('plain object', t => {
    t.false(isAPIError({}))
});

test('number', t => {
    t.false(isAPIError(1))
});