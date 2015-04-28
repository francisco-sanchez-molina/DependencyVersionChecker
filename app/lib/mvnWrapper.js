/* global define */
define([
  'cli',
  'q'
], function(
  cli,
  q) {

  var namespace = {};

  namespace.dependencyTree = function(pomPath) {
    console.log('MAVEN::DEPENDENCY:TREE ' + pomPath);
    return cli.eval('mvn dependency:tree -f ' + pomPath);
  };


  var graphToTableInternal = function(content, table, parentDeps) {
    table = table || {};
    parentDeps = parentDeps || '';
    var name = content.package + '::' + content.artifactID;
    var versions = table[name] || [];
    versions.push({
      version: content.version,
      scope: content.scope,
      parent: parentDeps
    });
    table[name] = versions;
    content.dependencies.forEach(function(dep) {
      graphToTableInternal(dep, table, parentDeps + ':::' + name + ':' + content.version);
    });
    return table;
  };

  namespace.graphToTable = function(content) {
    return q.resolve().then(function() {
      return graphToTableInternal(content);
    });
  };

  namespace.analyzeTree = function(content) {
    return q.resolve().then(function() {
      content = content.split("\n");
      var depth = 0;
      var analyze = [];
      var parent = '';
      var line;
      var lastLine;
      var firstDepFinded = false;
      var lastNode = [];

      while (content.length > 0) {
        lastLine = line;
        line = content.shift();
        var lineDepth = line.indexOf('\\-') + line.indexOf('+-') + 1;
        if (lineDepth > 0) {
          if (!firstDepFinded) {
            var moduleArray = lastLine.replace(/(\[INFO\])[\s]+/i, "").split(":");
            lastNode.push({
              package: moduleArray[0],
              artifactID: moduleArray[1],
              packageType: moduleArray[2],
              version: moduleArray[3],
              dependencies: [],
              last: false
            });
          }
          firstDepFinded = true;
          var dependencyArray = line.replace(/(\[INFO\])[+\\-\s|]+/i, "").split(":");

          var dependency = {
            package: dependencyArray[0],
            artifactID: dependencyArray[1],
            packageType: dependencyArray[2],
            version: dependencyArray[3],
            scope: dependencyArray[4],
            dependencies: [],
            last: line.indexOf('\\-') > 1
          };


          if (lineDepth === depth) {
            lastNode.pop();
            lastNode[lastNode.length - 1].dependencies.push(dependency);
            lastNode.push(dependency);
          }

          if (lineDepth > depth) {
            lastNode[lastNode.length - 1].dependencies.push(dependency);
            lastNode.push(dependency);
            depth = lineDepth;
          }


          if (lineDepth < depth) {
            while (lastNode[lastNode.length - 1].last) {
              lastNode.pop();
            }
            lastNode.pop();
            lastNode[lastNode.length - 1].dependencies.push(dependency);
            lastNode.push(dependency);
            depth = lineDepth;
          }
        }
      }
      var result = lastNode.shift();
      return result;
    });
  };


  namespace.dependencyList = function(pomPath) {
    console.log('MAVEN::DEPENDENCY:LIST ' + pomPath);
    return cli.eval('mvn dependency:list -f ' + pomPath);
  };

  namespace.analyzeDependencyList = function(list) {
    var result = {};
    list.forEach(function(line) {
      var entry = line.split(':');
      result[entry[0]] = {
        version: entry[1],
        scope: entry[2]
      };
    });
  };

  return namespace;

});
