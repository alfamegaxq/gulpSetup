#About

This is working gulp with base sass setup example with symfony3 demo project.

Gulp includes: 

- sass preprocessing
- css concat and minification
- svg images generation and sass mappings
- manifest for css, js versioning
- js, css watchers

# Setup

- copy `gulpfile.js`
- copy `package.json`
- copy everything from `src/AppBundle/Resources/public`
- copy `src/AppBundle/Twig/AssetVersionExtension.php`
- add entry in services.yml 
```
app.twig.twig_asset_version_extension:
         class: AppBundle\Twig\AssetVersionExtension
         arguments: ["%kernel.root_dir%"]
         tags:
             - { name: twig.extension }
```
- change settings and svgConfig in gulpfile.js according to your project
- write in head: `<link rel="stylesheet" href="{{ asset('assets/css/style.min.css'|asset_version) }}"/>`
- write in bottom of body `<script src="{{ asset('assets/js/script.js'|asset_version) }}"></script>`
