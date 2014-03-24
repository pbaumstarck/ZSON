ZSON
====

JSON is awesome. It solves so many problems. But it also creates a few, like,
"How do I add comments?" and "How do I conveniently build strings like HTML
templates?" Enter Bedizened JSON (ZSON).

ZSON adds these helpful, human-friendly features on top of regular JSON.
The ZSON parser strips out this special syntax and converts the input to
plain JSON, which is then interpreted by your JSON parser of choice.

Demo: http://www.itsagoldenage.com/zson

### Single-Line Comments

You have these now. Huzzah.

```javascript
{
  // Do not change unless you really, REALLY mean it.
  "self-destruct": false
}
```

### Multi-Line Comments

Because what would `//` be without its good friends `/*` and `*/`:

```javascript
/**
 * Header.
 */
{
  "foo": /* Here it comes ... */ "bar"
}
```

### Multi-Line Strings

Here comes the fun part. Use three double quotes to open and close a multi-line
string literal. Double quotes inside don't have to be escaped.

```javascript
{
  "soliloquy": """
To be, or not to be, that is the question—
Whether 'tis Nobler in the mind to suffer" ...""
  "template": """
<html>
  <body onload="javascript:alert('Hello, world!')">
    Hello, world!
  </body>
</html>
"""
}
```

### Trailing Commas

ZSON also goes Python style by allowing trailing commas after the last elements in lists and arrays:

```javascript
[
  1,
  2,
  3,
]
```

```javascript
{
  "a": 1,
  "b": 2,
  "c": 3,
}
```

### Thousands Separators for Numbers

This was really a spur-of-the-moment thing, but you can put underscores in
numeric literals to break up large numbers and make them more readable:

```javascript
{
  "mibi": 1_048_576,
  "gibi": 1_073_741_824,
  "tibi": 1_099_511_627_776
}
```

There's no validation that these have to be used as thousands separators, so
you could put the separators on the ten thousands if you wanted:

```javascript
{
  "8_yi": 8_0000_0000
}
```

### Custom JSON Parser

If you hate `JSON.parse`, you can send your own custom JSON parser to use as
the final step of the ZSON parser:

```javascript
var value = ZSON.parse('{}', goog.json.parse);
```

If you just want to get the raw JSON string back, you can pass a `false`
for the parser:

```javascript
var rawJson = ZSON.parse('{/*excise*/}', false);
// Returns '{}'
```

### Stringification

The module also includes `ZSON.stringify` which is just an alias to
`JSON.stringify`, to allow you to do all your ZSON parsing with one module.

### Testing

Run unit tests with `nodeunit tests/`.
