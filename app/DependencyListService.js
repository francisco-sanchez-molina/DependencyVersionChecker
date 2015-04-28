define([
    'q',
    'git',
    'mvn',
    'cli',
    'files'
  ],
  function(
    q,
    git,
    mvn,
    cli,
    files
  ) {

    var namespace = {};

    var extractFileFromGitArchive = function(content, path, filename) {
      var dst = path + '/' + filename;
      var dstTar = dst + '.tar';

      return cli.eval('mkdir -p ' + path).
      then(function() {
        return files.write(dstTar, content);
      }).
      then(function() {
        console.log('pom to ' + dst);
        return cli.eval('cat ' + dstTar + ' | tar -xO > ' + dst);
      });
    };

    var retrivePoms = function(basePath, poms) {
      var promises = [];
      Object.keys(poms).forEach(function(artifactName) {
        var promise = git.archive(poms[artifactName].repo, poms[artifactName].pom).
        then(function(content) {
          return extractFileFromGitArchive(content, basePath + '/' + poms[artifactName].path, 'pom.xml');
        });
        promises.push(promise);
      });
      return q.all(promises);
    };

    var mvnTreeArtifacts = function(basePath, checks, poms) {
      var artifacts = [];
      Object.keys(checks).forEach(function(checkName) {
        checks[checkName].forEach(function(artifactName) {
          if (artifacts.indexOf(artifactName) === -1) {
            artifacts.push(artifactName);
          }
        });
      });

      var promise = q.resolve();
      artifacts.forEach(function(artifact) {
        promise = promise.then(function() {
          return mvn.dependencyTree(basePath + '/' + poms[artifact].path + '/pom.xml').
          then(function(mvnResult) {
            return files.write(basePath + '/' + poms[artifact].path + '/pom.dep', mvnResult);
          });
        });
      });

      return promise;
    };


    var getArtifactsTableDependency = function(basePath, artifacts, poms) {
      var promises = [];
      var dependenciesTable = {};
      artifacts.forEach(function(artifact) {
        var mvnDepFile = basePath + '/' + poms[artifact].path + '/pom.dep';
        var promise = files.read(mvnDepFile).
        then(function(mvnResult) {
          return mvn.analyzeTree(mvnResult);
        }).
        then(function(dependencies) {
          return mvn.graphToTable(dependencies);
        }).
        then(function(table) {
          Object.keys(table).forEach(function(dependencyName) {
            var deps = dependenciesTable[dependencyName] || {};
            deps[artifact] = table[dependencyName];
            dependenciesTable[dependencyName] = deps;
          });
        });
        promises.push(promise);
      });

      return q.all(promises).then(function() {
        return dependenciesTable;
      });
    };


    namespace.getDependencies = function(config) {
      var temporalPath = config.temporalPath;
      var tables = {};
      return cli.eval('mkdir -p ' + temporalPath).
      then(function() {
        if (!config.skipRetrivePoms) {
          return retrivePoms(temporalPath, config.poms);
        }
      }).
      then(function() {
        if (!config.skipMvnTree) {
          return mvnTreeArtifacts(temporalPath, config.checks, config.poms);
        }
      }).
      then(function() {
        var promise = q.resolve();
        Object.keys(config.checks).forEach(function(checkName) {
          promise = promise.then(function() {
            return getArtifactsTableDependency(temporalPath, config.checks[checkName], config.poms);
          }).then(function(dependencies) {
            tables[checkName] = dependencies;
          });
        });
        return promise;
      }).then(function() {
        return tables;
      });

    };

    return namespace;

  });
