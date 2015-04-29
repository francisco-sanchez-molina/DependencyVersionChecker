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


    var createCell = function(content) {
      var txt = '';
      if (content) {
        txt += '<td><table class="internal">';
        content.forEach(function(version) {
          var dataParents = version.parent.replace(/:::/g, ' ');
          dataParents = dataParents ? (' data-parents="' + dataParents + '"') : dataParents;
          txt += '<tr class="noBorder"><td class="noBorder"' + dataParents + '>' + version.version + ' ' + version.scope + '</td></tr>';
        });
        txt += '</table></td>';
      } else {
        txt += '<td>-</td>';
      }
      return txt;
    };

    var createRow = function(num, columns, artifact, content) {
      var txt = '<tr>';
      if (num % 2) {
        txt = '<tr class="alt">';
      } else {
        txt = '<tr>';
      }
      var artifactStatus;
      if (content.status) {
        artifactStatus = 'artifactOk';
      } else {
        artifactStatus = 'artifactKo';
      }
      txt += '<td class="' + artifactStatus + '">' + artifact + '</td>';
      columns.forEach(function(name) {
        txt += createCell(content[name]);
      });
      txt += '</tr>';
      return txt;
    };

    function compare(package) {
      return function(a, b) {
        if (a.indexOf(package) === 0 && b.indexOf(package) === -1) {
          return -1;
        }
        if (a.indexOf(package) === -1 && b.indexOf(package) === 0) {
          return 1;
        }

        if (a < b) {
          return -1;
        }
        if (a > b) {
          return 1;
        }
        return 0;
      };
    }

    var createBody = function(columns, content, preferedPackage) {
      var txt = '';
      var cont = 0;
      Object.keys(content).sort(compare(preferedPackage)).forEach(function(artifact) {
        txt += createRow(cont, columns, artifact, content[artifact]);
        cont += 1;
      });
      return txt;
    };

    var createHeader = function(columns) {
      var txt = '<tr class="header">';
      txt += '<td></td>';
      columns.forEach(function(name) {
        txt += '<th>' + name + '</th>';
      });
      txt += '</tr>';
      return txt;
    };

    var getHeader = function() {
      return '<!doctype html><head><meta charset="utf-8"><title>Dependency checker</title>' +
        '<link rel="stylesheet" href="./style.css"></head>' +
        '<body>';
    };


    var closeHTML = function() {
      return '</body></html>';
    };


    var createTable = function(columns, content, preferedPackage) {
      return '<table class="dependencyTable">' + createHeader(columns) + createBody(columns, content, preferedPackage) + '</table>';
    };

    var writeResult = function(table, destination) {
      var fullPath = destination.path + '/' + destination.filename;

      return cli.eval('mkdir -p ' + destination.path).
      then(function() {
        return cli.eval('cp app/css/style.css ' + destination.path);
      }).
      then(function() {
        return files.write(fullPath, table);
      }).
      then(function() {
        console.log('Result write to ' + fullPath);
      });


    }

    namespace.render = function(tableStructure, content, preferedPackage, destination) {
      var resultFile = './table.html';
      var txt;
      txt = getHeader();
      Object.keys(tableStructure).forEach(function(name) {
        txt += '<div  class="tableContent"><h2>' + name + '</h2>';
        txt += createTable(tableStructure[name], content[name], preferedPackage);
        txt += '</div>';
      });
      txt += closeHTML();
      return writeResult(txt, destination);

    };

    return namespace;

  });
