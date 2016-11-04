import { isAPIError } from '../utils';

const defaultSettings = {
    key: 'retry',
    count: 0
};

export default function retryMw(settings) {

    settings = Object.assign({}, defaultSettings, settings);

    return next => async options => {

        let retry = options && options[settings.key] !== undefined ? options[settings.key] : settings.count;
        let result;

        if (!Number.isInteger(retry) || retry === 0) {
            return await next();
        }

        while (retry-- > -1) {

            result = await next();

            if (isAPIError(result)) {
                continue;
            }

            break;
        }

        return result;
    };
}
