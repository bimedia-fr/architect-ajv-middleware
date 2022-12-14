# architect-ajv-middleware

This architect plugin register a middleware to check that the request data matches an AJV schema.

The json schema must be specified in the route spec in the `validation` attribute:

```js
rest.get({
    url: '/',
    validation: ajvSchema
},
(req, res) => {
    // ...
});
```
The `title` attribute on the json schema must be set to unable ajv validator cache.

### Installation

```sh
npm install --save architect-ajv-middleware
```
### Config Format
```js
{
  "packagePath": "architect-ajv-middleware",
  "ajv": {
    allErrors: true,
    coerceTypes: true,
    useDefaults: true,
    removeAdditional: true
  },
  "http": {
    statusCode: 422,
    code: 'UnprocessableEntity'
  }
}
}
```