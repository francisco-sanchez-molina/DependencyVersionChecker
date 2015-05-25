/* global define */
define([

], function(
  ) {

  var namespace = {};

  namespace.Artifact = function(package, id, type, version, scope, dependencies, parent) {
    return new Artifact(package, id, type, version, scope, dependencies, parent);
  };

  function Artifact(package, id, type, version, scope, dependencies, parent) {
    this.package = package;
    this.id = id;
    this.type = type;
    this.version = version;
    this.scope = scope;
    this.dependencies = dependencies;
    this.parent = parent;
  }

  Artifact.prototype.getPackage = function () {
    return this.package;
  };

  Artifact.prototype.getId = function () {
    return this.id;
  };
  Artifact.prototype.getType = function () {
    return this.type;
  };

  Artifact.prototype.getVersion = function () {
    return this.version;
  };

  Artifact.prototype.getScope = function () {
    return this.scope;
  };


  Artifact.prototype.getParent = function () {
    return this.parent;
  };


  Artifact.prototype.setParent = function (parent) {
    this.parent = parent;
  };


  Artifact.prototype.getDependencies = function () {
    return this.dependencies;
  };

  Artifact.prototype.getName = function() {
    return this.package + '::' + this.id;
  };

  Artifact.prototype.addDependency = function(dependency) {
    this.dependencies.push(dependency);
  };


  Artifact.prototype.forEach = function(callback) {
    callback(this);
    this.dependencies.forEach(function(artifact) {
      artifact.forEach(callback);
    });
  };

  return namespace;

});
