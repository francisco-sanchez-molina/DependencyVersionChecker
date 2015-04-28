/* global define */
define([
  'child_process',
  'q'
], function(
  childProcess,
  q) {

  var namespace = {};

  var consoleExec = childProcess.exec;

  function exec(command) {
    var dfd = q.defer();
    var f = function(error, stdout, stderr) {
      if (error) {
        return dfd.reject(error, stdout, stderr);
      } else {
        return dfd.resolve(stdout);
      }
    };
    consoleExec(command, {
      encoding: 'utf8',
      timeout: 0,
      maxBuffer: 1024 * 1024,
      killSignal: 'SIGTERM',
      cwd: null,
      env: null
    }, f);
    return dfd.promise;
  }

  namespace.eval = function(command) {
    return exec(command);
  };

  return namespace;

});
