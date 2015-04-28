/* global define */
define([
  'fs',
  'q'
], function(
  fs,
  q) {

  var namespace = {};

  namespace.write = function(path, content) {
    var dfd = q.defer();
    fs.writeFile(path, content, function(err) {
      if (err) {
        dfd.reject(err);
      }
      dfd.resolve("The file was saved!");
    });
    return dfd.promise;
  };

  namespace.read = function(path) {
    var dfd = q.defer();
    fs.readFile(path, 'utf-8', function(err, result) {
      if (err) {
        dfd.reject(err);
      }
      dfd.resolve(result);
    });
    return dfd.promise;
  };

  return namespace;

});
