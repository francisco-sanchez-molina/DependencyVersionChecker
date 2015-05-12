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

    var mvnTreeArtifacts = function(basePath, modules, poms) {
      var artifacts = [];
      Object.keys(modules).forEach(function(moduleName) {
        modules[moduleName].forEach(function(artifactName) {
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


    var getModulesTableDependency = function(basePath, subModules, poms) {
      var promises = [];
      var dependenciesTable = {};
      subModules.forEach(function(subModule) {
        var mvnDepFile = basePath + '/' + poms[subModule].path + '/pom.dep';
        var promise = files.read(mvnDepFile).
        then(function(mvnResult) {
          return mvn.parseDependencyTree(mvnResult);
        }).
        then(function(dependencies) {
          dependencies.toList().forEach(function(dependency) {
            var deps = dependenciesTable[dependency.getName()] || {};
            var entry = deps[subModule] || [];
            entry.push(dependency);
            deps[subModule] = entry;
            dependenciesTable[dependency.getName()] = deps;
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
          return mvnTreeArtifacts(temporalPath, config.modules, config.poms);
        }
      }).
      then(function() {
        var promise = q.resolve();
        Object.keys(config.modules).forEach(function(moduleName) {
          promise = promise.then(function() {
            return getModulesTableDependency(temporalPath, config.modules[moduleName], config.poms);
          }).then(function(dependencies) {
            tables[moduleName] = dependencies;
          });
        });
        return promise;
      }).then(function() {
        return tables;
      });

    };

    return namespace;

  });
