var requirejs = require('requirejs');

requirejs.config({
  paths: {
    config: 'config',
    DependencyChecker: 'app/DependencyChecker',
    DependencyListService: 'app/DependencyListService',
    RenderDependencyListService: 'app/RenderDependencyListService',
    DependencyAnalyzerService: 'app/DependencyAnalyzerService',
    git: 'app/lib/gitWrapper',
    http: 'app/lib/httpWrapper',
    cli: 'app/lib/cliWrapper',
    mvn: 'app/lib/mvnWrapper',
    files: 'app/lib/fsWrapper',
    Artifact: 'app/model/Artifact'
  }
});

requirejs([
    'config',
    'DependencyChecker',
    'q'
  ],
  function(
    config,
    dependencyChecker,
    q
  ) {
    console.log('Dependency checker v0.1.0');

    q.longStackSupport = true;
    dependencyChecker.start(config);
  });
