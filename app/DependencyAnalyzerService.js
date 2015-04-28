define([
    'q'
  ],
  function(
    q
  ) {

    var namespace = {};

    var checkTable = function(columns, content) {
      Object.keys(content).forEach(function(artifact) {
        var version;
        var ok=true;

        columns.forEach(function(name) {
          var artifactVersions = content[artifact][name] || [];
          artifactVersions.forEach(function(node){
            version = version || node.version;
            if (version!==node.version) {
              ok = false;
            }
          });
        });

        content[artifact].status=ok;
      });

    };

    namespace.analyze = function(tableStructure, content) {
      Object.keys(tableStructure).forEach(function(name) {
         checkTable(tableStructure[name], content[name]);
      });
      return q.resolve(content);
    };

    return namespace;

  });
