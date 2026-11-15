import queryString from 'query-string';

/**
 * React Navigation parses the query string of every deep link with query-string 7, which is
 * CommonJS and `require()`s decode-uri-component. The npm override in package.json pins that to
 * 0.5.1 (for a DoS advisory), which is ESM-only. Without patches/query-string+7.1.3.patch the
 * require hands back a module object, not a function, and every deep link with a query string
 * (for example `lfg?onlyNew=true`) fails with "Object is not a function".
 */
describe('query-string with the pinned decode-uri-component', () => {
  it('parses a query string', () => {
    expect(queryString.parse('category=need&mine=true')).toEqual({category: 'need', mine: 'true'});
  });

  it('decodes percent-encoded values', () => {
    expect(queryString.parse('subject=Re%3A%20Sunscreen')).toEqual({subject: 'Re: Sunscreen'});
  });
});
