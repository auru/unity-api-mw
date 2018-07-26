import { isAPIError } from './utils';

const defaultSettings = {
    key: 'response'
};

export default function responseMw(settings) {
    settings = Object.assign({}, defaultSettings, settings);

    return next => async options => {
        const result = await next();

        if (isAPIError(result) || (options && options[settings.key])) {
            return result;
        }

        return result.body;
    };
}
