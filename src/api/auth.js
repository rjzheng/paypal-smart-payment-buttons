/* @flow */

import { ZalgoPromise } from 'zalgo-promise/src';
import { inlineMemoize, base64encode, request } from 'belter/src';

import { AUTH_API_URL } from '../config';
import { getLogger } from '../lib';

export function createAccessToken (clientID : string) : ZalgoPromise<string> {
    return inlineMemoize(createAccessToken, () => {

        getLogger().info(`rest_api_create_access_token`);

        const basicAuth = base64encode(`${ clientID }:`);

        return request({

            method:  `post`,
            url:     AUTH_API_URL,
            headers: {
                Authorization: `Basic ${ basicAuth }`
            },
            data: {
                grant_type: `client_credentials`
            }

        }).then(({ body }) => {

            if (body && body.error === 'invalid_client') {
                throw new Error(`Auth Api invalid client id: ${ clientID }:\n\n${ JSON.stringify(body, null, 4) }`);
            }

            if (!body || !body.access_token) {
                throw new Error(`Auth Api response error:\n\n${ JSON.stringify(body, null, 4) }`);
            }

            return body.access_token;
        });
    }, [ clientID ]);
}
