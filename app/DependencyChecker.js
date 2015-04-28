define([
      'DependencyListService',
      'DependencyAnalyzerService',
      'RenderDependencyListService'
  ],
  function(
    dependencyListService,
    dependencyAnalyzerService,
    render
  ) {

    var namespace = {};

    namespace.start = function(config) {
      return dependencyListService.getDependencies(config).
      then(function(dependencies){
        return dependencyAnalyzerService.analyze(config.checks, dependencies);
      }).
      then(function(dependencies){
        return render.render(config.checks, dependencies, config.preferedPackage);
      }).
      fail(function(error) {
        console.log(error);
        process.exit(-1);
      });

    };

    return namespace;

  });
