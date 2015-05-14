/* global define */
define([
  'cli'
], function(
  cli) {

  var namespace = {};

  namespace.archive = function(address) {
    console.log('HTTP::ARCHIVE '+address);
    return cli.eval('curl ' + address);
  };


  return namespace;

});
