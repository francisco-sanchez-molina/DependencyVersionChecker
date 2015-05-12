/* global define */
define([
  'cli',
  'q',
  'Artifact'
], function(
  cli,
  q,
  Artifact) {

  var namespace = {};

  namespace.dependencyTree = function(pomPath) {
    console.log('MAVEN::DEPENDENCY:TREE ' + pomPath);
    return cli.eval('mvn dependency:tree -f ' + pomPath);
  };


  var extractArtifact = function(line) {
    var dependencyArray = line.replace(/(\[INFO\])[+\\-\s|]*/i, "").split(":");

    var package = dependencyArray[0];
    var artifactID = dependencyArray[1];
    var packageType = dependencyArray[2];
    var version = dependencyArray[3];
    var scope = dependencyArray[4];
    var dependencies = [];
    var parent = '';

    return Artifact.Artifact(package, artifactID, packageType, version, scope, dependencies, parent);
  };

  namespace.parseDependencyTree = function(content) {
    return q.resolve().then(function() {
      content = content.split("\n");
      var depth = 0;
      var line;
      var lastLine;
      var firstDepFinded = false;
      var analyzeTree;
      var analyzerStack = [];

      while (content.length > 0) {
        lastLine = line;
        line = content.shift();
        var lineDepth = line.indexOf('\\-') + line.indexOf('+-') + 1;

        if (lineDepth > 0) {
          if (!firstDepFinded) {
            analyzeTree = extractArtifact(lastLine, '');
            analyzeTree.last = false;
            analyzerStack.push(analyzeTree);
            firstDepFinded = true;
          }

          var dependency = extractArtifact(line);
          dependency.last = line.indexOf('\\-') > 1;

          if (lineDepth === depth) {
            analyzerStack.pop();
          }

          if (lineDepth > depth) {
            depth = lineDepth;
          }

          if (lineDepth < depth) {
            while (analyzerStack[analyzerStack.length - 1].last) {
              delete(analyzerStack.pop().last);
            }
            analyzerStack.pop();
            depth = lineDepth;
          }

          var parentArtifact = analyzerStack[analyzerStack.length - 1];
          parentArtifact.addDependency(dependency);
          var parent = parentArtifact.getParent() + ':::' + parentArtifact.getName() +"-"+parentArtifact.getVersion();

          dependency.setParent(parent);
          analyzerStack.push(dependency);

        }
      }
      while (analyzerStack[analyzerStack.length - 1].last) {
        delete(analyzerStack.pop().last);
      }

      return analyzeTree;
    });
  };


  namespace.dependencyList = function(pomPath) {
    console.log('MAVEN::DEPENDENCY:LIST ' + pomPath);
    return cli.eval('mvn dependency:list -f ' + pomPath);
  };



  return namespace;

});
