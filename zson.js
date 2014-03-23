/**
 * Bedizened JSON. Because humanity deserves it.
 * Copyright 2014 Paul G. Baumstarck
 * MIT License
 */

/**
 * An enum for what mode the parser is in.
 * @enum {number}
 */
var Mode = {
  // Parsing normal JSON content.
  'CONTENT': 1,
  // Parsing a single-line comment.
  'SINGLE_LINE_COMMENT': 2,
  // Parsing a multi-line comment.
  'MULTI_LINE_COMMENT': 3,
  // Parsing a single-line string.
  'SINGLE_LINE_STRING': 4,
  // Parsing a multi-line string.
  'MULTI_LINE_STRING': 5,
  // Parsing a number.
  'NUMBER': 6
};

var ZSON = {
  /**
   * Parses the string as Bedizoned JSON (ZSON).
   * @param {string} str The string input to parse.
   * @param {(function(string):*|boolean)=} opt_jsonParser An optional parser
   *     to use to convert the de-bedizoned JSON string into an object. If not
   *     specified, `JSON.parse` will be used. If `false` is passed, the
   *     processed JSON string will be returned un-parsed.
   * @return {*} The parsed expression, or the plain JSON string if a null
   *     parser was sent.
   */
  parse: function(str, opt_jsonParser) {
    var length = str.length;
    var mode = Mode.CONTENT;
    var ix = 0;
    var escaped = false;

    // Convert it to an array, and we either delete or expand characters to
    // make it conform to plain JSON.
    str = str.split('');
    while (ix < length) {
      // Capture the current character and two lookaheads.
      var chr = str[ix];
      var look1 = ix + 1 < length ? str[ix + 1] : undefined;
      var look2 = ix + 2 < length ? str[ix + 2] : undefined;
      if (mode == Mode.CONTENT) {
        if (chr == '"') {
          if (look1 == '"' && look2 == '"') {
            // It's the start of a multi-line string, so terminate the extra
            // double quotes.
            str[ix + 1] = '';
            str[ix + 2] = '';
            ix += 3;
            mode = Mode.MULTI_LINE_STRING;
          } else {
            // It's the start of a single-line string.
            ++ix;
            mode = Mode.SINGLE_LINE_STRING;
          }
        } else if (chr == '/' && look1  == '/') {
          // It's the start of a single-line comment.
          str[ix] = '';
          str[ix + 1] = '';
          ix += 2;
          mode = Mode.SINGLE_LINE_COMMENT;
        } else if (chr == '/' && look1 == '*') {
          str[ix] = '';
          str[ix + 1] = '';
          ix += 2;
          mode = Mode.MULTI_LINE_COMMENT;
        } else if (chr == '-' || chr >= '0' && chr <= '9') {
          mode = Mode.NUMBER;
        } else {
          ++ix;
        }
      } else if (mode == Mode.SINGLE_LINE_COMMENT) {
        if (chr == '\n') {
          mode = Mode.CONTENT;
          ++ix;
        } else {
          str[ix] = '';
          ++ix;
        }
      } else if (mode == Mode.MULTI_LINE_COMMENT) {
        if (chr == '*' && look1 == '/') {
          str[ix] = '';
          str[ix + 1] = '';
          ix += 2;
          mode = Mode.CONTENT;
        } else {
          str[ix] = '';
          ++ix;
        }
      } else if (mode == Mode.SINGLE_LINE_STRING) {
        if (escaped) {
          escaped = false;
          ++ix;
        } else if (chr == '\\') {
          escaped = true;
          ++ix;
        } else if (chr == '"') {
          ++ix;
          mode = Mode.CONTENT;
        } else {
          ++ix;
        }
      } else if (mode == Mode.MULTI_LINE_STRING) {
        if (escaped) {
          escaped = false;
          ++ix;
        } else if (chr == '\\') {
          escaped = true;
          ++ix;
        } else if (chr == '\n') {
          // Replace newlines with escaped newlines.
          str[ix] = '\\n';
          ++ix;
        } else if (chr == '"') {
          if (look1 == '"' && look2 == '"') {
            // We're leaving the multi-line string.
            str[ix + 1] = '';
            str[ix + 2] = '';
            ix += 3;
            mode = Mode.CONTENT;
          } else {
            // We have to escape the quote inside the quoted string.
            str[ix] = '\\"';
            ++ix;
          }
        } else {
          ++ix;
        }
      } else if (mode == Mode.NUMBER) {
        if (chr == '_') {
          // Underscores can be used as thousands separators.
          str[ix] = '';
          ++ix;
        } else if (chr >= '0' && chr <= '9' || chr == 'e' || chr == '-' ||
                   chr == '+') {
          // Still parsing a number.
          ++ix;
        } else {
          // Not parsing a number anymore, so re-check this as content by
          // keeping 'ix' in the same place.
          mode = Mode.CONTENT;
        }
      } else {
        throw Error('Unknown parsing mode');
      }
    }
    if (mode == Mode.SINGLE_LINE_COMMENT) {
      mode = Mode.CONTENT;
    }
    if (mode != Mode.CONTENT && mode != Mode.NUMBER) {
      throw Error('Bad content');
    }
    var jsonStr = str.join('');
    if (opt_jsonParser === false) {
      return jsonStr;
    } else if (opt_jsonParser) {
      return opt_jsonParser(jsonStr);
    } else {
      return JSON.parse(jsonStr);
    }
  },
  /**
   * For congruence with 'JSON' we include a 'stringify' method.
   */
  stringify: JSON.stringify
};

if (typeof module !== 'undefined') {
  module.exports = ZSON;
}
