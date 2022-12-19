const Ajv = require('ajv');

module.exports = function (options, imports, register) {

    let ajv = new Ajv(Object.assign({}, {
        allErrors: true,
        coerceTypes: true,
        useDefaults: true,
        removeAdditional: true
    }, options.ajv));

    const http = Object.assign({}, {
        statusCode: 422,
        code: 'UnprocessableEntity'
    }, options.http);

    require('ajv-errors')(ajv);
    require('ajv-formats').default(ajv);
    let rest = imports.rest;
    let log = imports.log.getLogger('validation');

    const validators = {};

    function getValidationSchema (req) {
        return req.route && (req.route.validation || (req.route.spec && req.route.spec.validation));
    }

    function getValidator(req, schema) {
        let key = schema.$id;
        if (!key) {
            // $id is not defined, we try to build a uniq key from route spec and schema title
            let path = req.route.spec && req.route.spec.path;
            if (!path && !schema.title) {
                // we can't reliably build a suitable cache key, cache is disabled
                return ajv.compile(schema);
            }
            key = [req.method, path, schema.title].join('|');
        }
        if (validators[key]) {
            return validators[key];
        }
        let validator = ajv.compile(schema);
        validator[key] = validator;
        return validator;
    }

    // Ajv validator for rest routes
    function middleware(req, res, next) {
        let schema = getValidationSchema(req);
        if (!schema) {
            return next();
        }
        let validator = getValidator(req, schema);
        const valid = validator({
            path: req.params, // path params
            body: req.body // body params
        });
        if (valid) {
            return next();
        }
        if (req.accepts('application/json')) {
            res.set('Content-Type', 'application/json; charset=utf-8');
        }
        log.info('requete non valide:', ajv.errors.map(e => e.message).join(','), ajv.errors);
        return res.send(http.statusCode, {
            code: http.code,
            message: ajv.errors.map(e => e.message).join(','),
            errors: ajv.errors
        });
    }
    rest.use(middleware);
    register();
};
module.exports.consumes = ['log', 'rest'];
