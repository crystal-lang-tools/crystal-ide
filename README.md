# Crystal IDE

Crystal IDE provides syntax coloring and error checking to
Visual Studio Code.

Crystal IDE is implemented using the Language Server Protocol.

[A blog post about Language Server Protocol](https://code.visualstudio.com/blogs/2016/06/27/common-language-protocol)


## Dependencies

You must have the Crystal compiler installed and on your path.

[Instructions for installing Crystal](https://crystal-lang.org/docs/installation/index.html)

## Roadmap

The goal is too implement all of the currently supported Language Server Features.

 * Document Highlights: highlights all 'equal' symbols in a text document.
 * Hover: provides hover information for a symbol selected in a text document.
 * Signature Help: provides signature help for a symbol selected in a text document.
 * Goto Definition: provides go to definition support for a symbol selected in a text document.
 * Find References: finds all project-wide references for a symbol selected in a text document.
 * List Document Symbols: lists all symbols defined in a text document.
 * List Workspace Symbols: lists all project-wide symbols.
 * Code Actions: compute commands for a given text document and range.
 * CodeLens: compute CodeLens statistics for a given text document. (OK, maybe not this one)
 * Document Formatting: this includes formatting of whole documents, document ranges and formatting on type.
 * Rename: project-wide rename of a symbol.

## Using Scry

The server is currently implemented in Node and shells out to the compiler.

An experimental server ([Scry](https://github.com/kofno/scry), written in Crystal)
is also available on 64bit Linux and OS X.

To use Scry, download the appropriate binary and configure your settings for
for a custom backend:

```
"crystal-ide.backend": "custom",
"crystal-ide.customCommand": "/path/to/scry"
```

[Scry Releases](https://github.com/kofno/scry/releases)

## Contributing

1. Fork it ( https://github.com/kofno/crystal-ide/fork )
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create a new Pull Request

## Contributors

- [kofno](https://github.com/kofno) Ryan L. Bell - creator, maintainer

