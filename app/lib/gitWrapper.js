/* global define */
define([
  'cli'
], function(
  cli) {

  var namespace = {};

  namespace.archive = function(repo, path) {
    console.log('GIT::ARCHIVE '+repo+' '+path);
    return cli.eval('git archive --remote=' + repo + ' HEAD: ' +  path);
  };


  return namespace;

});
