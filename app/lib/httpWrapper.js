/* global define */
define([
  'cli'
], function(
  cli) {

  var namespace = {};

  namespace.archive = function(address) {
    console.log('HTTP::ARCHIVE '+repo+' '+path);
    return cli.eval('curl ' + address);
  };


  return namespace;

});
