This is a [Deno](https://deno.land/) project.

# Tools
```sh
# Inspect roche-style-template.dotx/word/styles.xml
# Work in progress
deno run -A executables/get-styles-from-dotx.ts demos/from-template.dotx
```

# Demos

```sh
# A simple DOCX
deno run -A ./demos/hello-world.tsx && open hello-world.docx

# A simple DOCX, but it contains an image or a table
deno run -A ./demos/images.tsx && open images.docx
deno run -A ./demos/tables.tsx && open tables.docx

# An XML of Shakespeare's Macbeth, converted to a DOCX file
deno run -A ./demos/macbeth.tsx && open macbeth.docx

# An XML of a food recipe, converted to a DOCX file and including some change tracking info (WIP)
deno run -A ./demos/mushroom-lunch.tsx && open mushroom-lunch.docx
```