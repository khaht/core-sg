# Utils

## env.util.js

// Returns the env if defined without casting it

```js
env('VAR', 'default');
```

// Cast to int (using parseInt)

```js
env.int('VAR', 0);
```

// Cast to float (using parseFloat)

```js
env.float('VAR', 3.14);
```

// Cast to boolean (check if the value is equal to 'true')

```js
env.bool('VAR', true);
```

// Cast to js object (using JSON.parse)

```js
env.json('VAR', { key: 'value' });
```

// Cast to an array (syntax: ENV_VAR=[value1, value2, value3] | ENV_VAR=["value1", "value2", "value3"])

```js
env.array('VAR', [1, 2, 3]);
```

// Case to date (using new Date(value))

```js
env.date('VAR', new Date());
```

## logger.util.js

Select the level of logs among `fatal`, `error`, `warn`, `info`, `debug`, `trace`

```js
LOG_LEVEL = 'info';
```
