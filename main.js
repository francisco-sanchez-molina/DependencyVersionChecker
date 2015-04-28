var requirejs = require('requirejs');

requirejs.config({
  paths: {
    config: 'config',
    DependencyChecker: 'app/DependencyChecker',
    DependencyListService: 'app/DependencyListService',
    RenderDependencyListService: 'app/RenderDependencyListService',
    DependencyAnalyzerService: 'app/DependencyAnalyzerService',
    git: 'app/lib/gitWrapper',
    cli: 'app/lib/cliWrapper',
    mvn: 'app/lib/mvnWrapper',
    files: 'app/lib/fsWrapper',
  }
});

requirejs([
    'config',
    'DependencyChecker'
  ],
  function(
    config,
    dependencyChecker
  ) {
    console.log('Dependency checker v0.1.0');

    dependencyChecker.start(config);
  });
