# handlebars-loader-neo

Produce the results of compiling the given handlebars template.

## Getting Started

First, install `handlebars-loader-neo`:

```console
npm install --save-dev handlebars-loader-neo
```

Create your template files:

**content.hbs**
```html
<header>
  <img alt="..." src="./banner.jpg">
</header>
<main>
  ...
</main>
```

**index.hbs**
```html
...
<body>
  <div id="content">{{> ./content }}  </div>
</body>
...
```

Import your main template:

**file.hbs**

```js
import html from './index.hbs'
```

Then add the loader to your `webpack` config:

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.hbs$/i,
        loader: 'handlebars-loader-neo',
      },
    ],
  },
};
```

Use `html-loader` to include images, videos etc. found in the templates:

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.hbs$/i,
        use: [
          {
            loader: "handlebars-loader-neo",
            options: { inputCompatibility: "htmlLoader" },
          },
          { loader: "html-loader" },
        ],
      },
    ],
  },
};

```

## Options

|                Name                 |        Type         |                   Default                    | Description                                      |
| :---------------------------------: | :-----------------: | :------------------------------------------: | :----------------------------------------------- |
| `extensions` | `{Array.<string>}` | `['.handlebars', 'hbs', '.hb']` | The file extensions to try when resolving resource names. This array is always merged with a default set of extensions. Order matters, the extensions will be tried from lowest index to highest, with the defaults being tried last. |
|`rootPath` |`{string}` |`The current request context or './'` | Used as the root path for resolving "root relative" resource names. Root relative resource names are names that are not absolute paths and do not start with a "dot directory". If both this option and "rootRelative" are set, this value should take presidence.  |
|`rootRelative` | | |Alias for `rootPath`. For compatibility with `handlebars-loader` |
|`knownHelper` |`{Array<string>}` |`[]` | Array of helpers that are registered at runtime and should not explicitly be required by webpack. |
|`inlineRequires` |`{(null|string|RegExp|Array.<(null|string|RegExp)>)}` |`null` | Zero or more regular expressions each matching a string to be replaced with a require statement. Each RegExp must contain a named group named "path" that captures the string that should be used as the require statements path. |
|`exclude` |`{(null|string|RegExp|Array.<(null|string|RegExp)>)}` |`null` | Defines zero or more regex that match paths to exclude from resolving. This can be used to prevent helpers from being resolved to modules in the node_modules directory. |
|`logLevel` |`{(0|1|2|3)}` |`0` | Toggles logging information. To stay compatible with the original handlebars-loader, setting this value to "true" set the log level to LogLevel.Debug. Setting this value to "false" does nothing. The log level remains as is. Log level 0 is turns logging off, 1 sets logging to "Error", 2 sets logging to "Warning", and 3 sets logging to "Info". |
|`debug` | | | alias for `logLevel` |
|`runtimePath` |`{string}` |`'handlebars/runtime'` | Path to the runtime library. |
|`runtime` | | | alias for `runtimePath` |
|`helpersDirs` | `{Array.<string>}` | `[]` | Defines additional directories to be searched for helpers. Allows helpers to be defined in a directory and used globally without relative paths. You must surround helpers in subdirectories with brackets (Handlerbar helper identifiers can't have forward slashes without this). |
|`partialDirs` |`{Array.<string>}` | `[]` | Defines additional directories to be searched for partials. Allows partials to be defined in a directory and used globally without relative paths.  |
|`ignoreHelpers` |`{(null|string|RegExp|Array.<(null|string|RegExp)>)}` |`null` | Prevents matching helpers from being loade at build time. Useful for manually loading partials at runtime. |
|`ignorePartials` |`{(null|string|RegExp|Array.<(null|string|RegExp)>)}` |`null` | Prevents matching partials from being loaded at build time. Useful for manually loading partials at runtime. |
|`parseOptions` |`{Handlebars.ParseOptions}` |`{}` | Options to pass to the Handlebars parser. |
|`precompileOptions` |`{Handlebars.PrecompileOptions}` |`{}` | Options to pass to the Handlebars precompiler. |
|`compileOptions` |`{Handlebars.CompileOptions}` |`{}` | Options to pass to the Handlebars compiler. |
|`failLoudly` |`{boolean}` |`true` |If "true", the loader will throw a fatal error whenever a problem is encountered, stopping the compilation. If "false", the compilation will simply continue. If one or more errors prevent the compilation from being successfull, it will simply produce an empty string. |
|`templateContextFile` |`{string}` |`''` |The path to a JS file that exports a simple Object to be used as the context when compiling the template. |
|`inputCompatibility` |`{(default|htmlLoader)}` |`'default'` |Prepares the loader to accept input from different kinds of loader. |
|`outputFormat` |`{(default)}` |`'defulat'` |Format the loader to be passed to another loader. |d
