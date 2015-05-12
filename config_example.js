/* global define */
define([], function() {

  return {
    preferedPackage : 'org.example',
    poms: {
      artifact1: {
        repo: 'ssh://git@github.com/repo1.git',
        pom: 'pom.xml',
        path: 'repo1'
      },
      artifact2: {
        repo: 'ssh://git@github.com/repo2.git',
        pom: 'pom.xml',
        path: 'repo2'
      },
      artifact3: {
        repo: 'ssh://git@github.com/repo3.git',
        pom: 'pom.xml',
        path: 'repo3'
      },
      artifact4: {
        repo: 'ssh://git@github.com/repo4.git',
        pom: 'pom.xml',
        path: 'repo4'
      }
    },
    modules: {
      checkGroup1 : ['artifact1', 'artifact2'],
      checkGroup2 : ['artifact3', 'artifact4']
    },
    result: {
      path: 'results',
      filename: 'table.html'
    }
  };

});
