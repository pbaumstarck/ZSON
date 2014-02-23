
var ZSON = require('../zson.js');
var fs = require('fs');

exports.testBasicTypes = function(test) {
  test.equal(1, ZSON.parse('1'));
  test.equal(-123123, ZSON.parse('-123123'));
  test.equal(true, ZSON.parse('true'));
  test.equal(false, ZSON.parse('false'));
  test.equal('asdf', ZSON.parse('"asdf"'));
  test.deepEqual([], ZSON.parse('[]'));
  test.deepEqual({}, ZSON.parse('{}'));
  test.done();
};

exports.testComplicatedNumbers = function(test) {
  test.equal(-1, ZSON.parse('-1'));
  test.equal(-1e4, ZSON.parse('-1e4'));
  test.equal(-1e-4, ZSON.parse('-1e-4'));
  test.equal(-1.024, ZSON.parse('-1.024'));
  test.equal(-1.024e4, ZSON.parse('-1.024e4'));
  test.done();
};

exports.testNumbersWithUnderscores = function(test) {
  test.equal(1000, ZSON.parse('1_000'));
  test.equal(-1000, ZSON.parse('-1_000'));
  test.equal(1432e3, ZSON.parse('1_432e3'));
  test.equal(-1432e3, ZSON.parse('-1_432e3'));
  test.equal(-1432e1111, ZSON.parse('-1_432e1_111'));
  test.equal(9876543210987654321, ZSON.parse('9_876_543_210_987_654_321'));
  test.equal(-9876543210987654321, ZSON.parse('-9_876_543_210_987_654_321'));
  test.deepEqual({
    'mibi': 1048576,
    'gibi': 1073741824,
    'tibi': 1099511627776
  }, ZSON.parse([
    '{',
    '  "mibi": 1_048_576,',
    '  "gibi": 1_073_741_824,',
    '  "tibi": 1_099_511_627_776',
    '}'
  ].join('\n')));
  test.deepEqual({'8_yi': 800000000}, ZSON.parse('{"8_yi": 8_0000_0000}'));
  test.done();
};

exports.testSingleLineCommentsWithNumbers = function(test) {
  test.equal(1, ZSON.parse([
    '',
    '',
    '1  // Comment',
    '',
    ''
  ].join('\n')));
  test.equal(1, ZSON.parse([
    '// Header comment',
    '',
    '1  // Comment',
    '',
    ''
  ].join('\n')));
  test.equal(1, ZSON.parse([
    '',
    '',
    '1// Inline',
    '',
    '//trailing'
  ].join('\n')));
  test.done();
};

exports.testSingleLineCommentsWithArrays = function(test) {
  test.deepEqual(['array start', 1, 2, 'foo'], ZSON.parse([
    '// Header',
    '["array start",',
    '1  // Comment',
    '// ineline',
    ',2,"foo"//goo',
    '//]',
    ']//'
  ].join('\n')));
  test.done();
};

exports.testSingleLineCommentsWithObjects = function(test) {
  test.deepEqual({'array start': true}, ZSON.parse([
    '//{ Header',
    '{"array start"//key',
    '://valuetrue',
    'true//value',
    '//}',
    '}//'
  ].join('\n')));
  test.done();
};

exports.testMultiLineCommentsWithNumbers = function(test) {
  test.equal(2, ZSON.parse([
    '/*in teh beginnin',
    '*more comment',
    'more comment',
    'and there was * * * * * / / / /*/2'
  ].join('\n')));
  test.equal(21, ZSON.parse('2/*in teh eginning therewas comma*/1'));
  test.equal(2642763, ZSON.parse('2/*,*/642/*,*/763'));
  test.done();
};

exports.testMultiLineCommentsInline = function(test) {
  test.deepEqual({
    'key': 'value',
    'key2': 'value2'
  }, ZSON.parse([
    '{"key": "value", /*****',
    '',
    ' "key1": "value1",',
    '******/"key2": "value2"}',
    '/********/',
    ''
  ].join('\n')));
  test.done();
};

exports.testCommentsInsideStrings = function(test) {
  test.equal(' So ... // comment!!!!', ZSON.parse('" So ... // comment!!!!"'));
  test.equal(' Again /* stuff!', ZSON.parse('" Again /* stuff!"'));
  test.equal(' Again /* stuff! */', ZSON.parse('" Again /* stuff! */"'));
  test.done();
};

exports.testMultiLineStrings = function(test) {
  test.equal('', ZSON.parse('""""""'));
  test.equal('\n', ZSON.parse('"""\\n"""'));
  test.equal('\n', ZSON.parse([
    '"""',
    '"""'
  ].join('\n')));
  test.equal('A\nB', ZSON.parse([
    '"""A',
    'B"""'
  ].join('\n')));
  test.equal('A\n    B', ZSON.parse([
    '"""A',
    '    B"""'
  ].join('\n')));
  test.equal('A    \n    B', ZSON.parse([
    '"""A    ',
    '    B"""'
  ].join('\n')));
  test.equal('"quoted"', ZSON.parse('""""quoted\\""""'));
  test.equal('A "" "asdf" ', ZSON.parse('"""A "" "asdf" """'));
  test.done();
};

exports.testMultiLineStringsInObjects = function(test) {
  test.deepEqual(['A\nB', '', '\n C '], ZSON.parse([
    '["""A',
    'B""","""""","""',
    ' C """]'
  ].join('\n')));
  test.deepEqual({'Multi\n-\nKey': 'Multi\n-\nValue'}, ZSON.parse([
    '{"""Multi',
    '-',
    'Key""":"""Multi',
    '-',
    'Value"""}'
  ].join('\n')));
  test.done();
};

exports.testReadFile = function(test) {
  fs = require('fs');
  var body = fs.readFileSync('tests/test.zson', 'utf8');
  test.deepEqual([
    1,
    2,
    true,
    false,
    '',
    '\nA\nB\nC\n',
    {
      'foo': 'bar',
      'FOO\nOOF': 'BAR\nRAB',
      'new': '//',
      'new1': '/* */',
      'new2': '"quote"',
      'new3': 1000000
    }
  ], ZSON.parse(body));
  test.done();
};

exports.testSingleLineStrings = function(test) {
  test.equal('asdf \" is escaped \' ',
             ZSON.parse('\n"asdf \\" is escaped \' "\n'));
  test.done();
};

exports.testCustomParser = function(test) {
  var fakeParser = function() { return 3; }
  test.deepEqual({}, ZSON.parse('{/*excise*/}', null));
  test.equal(3, ZSON.parse('"Code number?"', fakeParser));
  test.equal('{}', ZSON.parse('{/*excise*/}', false));
  test.done();
};
