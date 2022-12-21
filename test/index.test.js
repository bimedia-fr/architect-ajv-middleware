const assert = require('assert');   
const getService = require('../src/index')

describe('middleware', () => {

    var middleware;

    const schema = {
        $schema: 'http://json-schema.org/schema#',
        $id: 'read-consents',
        title: 'Read consents',
        type: 'object',
        required: ['path'],
        properties: {
            path: {
                type: 'object',
                required: ['screen'],
                properties: {
                    screen: {
                        type: 'string'
                    },
                    consumerId: {
                        anyOf: [
                            {
                                type: 'string',
                                format: 'uuid'
                            },
                            {
                                type: 'string'
                            }
                        ]
                    },
                    additionalProperties: false
                }
            }
        }
    };

    beforeEach((done) => {
        const opts = {};
        const imports = {
            log : {
                getLogger : () => {
                    return{
                        info : (...args) => {
                            args.forEach(arg => {
                                console.log(arg)
                            });
                        }
                    }
                }
            },
            rest : {
                use : (m) => {middleware = m}
            }
        };
        const register = () => {};
        service = getService(opts, imports, register);
        done();
    })

    it('valid request ', (done) => {
        const req = {
            route : {
                validation : schema
            },
            params : {screen : 'toto', consumerId : 'id1'}
        }
        middleware(req,{},() => {
            done();
        })
    });

    it('Invalid Request', (done) => {
        const req = {
            route : {
                validation : schema
            },
            params : {otherParam : 'toto'},
            accepts : () => false
        }
        const res = {send : (status, body) => {
            assert.strictEqual(body.code, 'UnprocessableEntity');
            assert.strictEqual(body.errors.length, 1);
            assert.deepStrictEqual(body.errors[0].params, { missingProperty: 'screen' })

            done();
        }}

        middleware(req,res,() => {
            // assert.ok(res);
            done(new Error('may not be here'));
        })
    });

});