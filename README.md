Bower: 
> bower install preloadjs --save

The mechanism is simple, first you need an app structure. And a version, if the version is different than the actual version, the app will be deleted from our local storage. If the scripts are staying in local storage, then will be consumed instantly, otherwise will be getting from the server.

```javascript
<script type="text/javascript">
    var applicationMap = {
      core: {
        scripts: ['vendors/angular.min.js', 'vendors/angular-route.min.js'],
        initOnLoad: false // * This can be true, but in this example, the module 'myApp' will call the module 'core', because is a dependency *
      },
      myApp: {
        scripts: ['app.js','view1/view1.js','view2/view2.js', 'components/version/version.js', 'components/version/version-directive.js', 'components/version/interpolate-filter.js'],
        dependencies: ['core'],
        isAngularModule: true,
        initOnLoad: true
      }
    };

    var version = 0.1;

    var debugMode = true;

    preload(applicationMap, version, debugMode);
</script>
```

The local storage limit is up to 5MB, so maybe you want to compress your scripts.


##### This project emerged as [HeberLZ](https://github.com/HeberLZ) idea of [Google Developers Group Mendoza](https://www.facebook.com/GDGMendoza)