# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2017-06-20
### Added
- add this changelog
- add functionality for "inlineRequires" config option
- add examples for "inlineRequires" to README.md
- add support for referencing file under the "node_modules" directory.

### Changed
- change handlebars package from being a dependency to being a peer dependency
- rename Handlebars.setup_runtime to Handlebars.setup_compiler
- update Utils.make_regexp to accept an array as input
- update Loader.Config.create to us Utils.make_regexp to process any option that accepts a RegExp
- update "get_effective_config" in the main index.js file to no longer preprocess options that accept RegExp .

### Removed
- remove unused modules Handlebars.InternalBlocksVisitor & Handlebars.AST
- remove "compileOptions" from "Loader" type definition
- remove "knownHelpers" from Loader.Config type definition
- remove "exclude" from config options

### Fixed
- fix issue with "extensions" array causing duplicate values
