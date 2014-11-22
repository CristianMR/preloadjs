/**
 * preloadjs 0.1.0
 * https://github.com/CristianMR/preloadjs
 * (c) Cristian Martín Rios 2014 | License MIT
 */
(function(window){

    function preload(map, version, debug){

        //Only show internal console, if is in debug mode
        var console = function(debug){
            if(!debug) return {log: function(){}};
            return {log: window.console.log.bind(window.console)}
        }(debug);

        var body = document.getElementsByTagName('body')[0];

        //If there is no localStorage, then object
        var storage = typeof localStorage !== "undefined" ? localStorage : {};

        var modsLoaded = [];
        var modsInitiated = [];
        var callbackModList = {};

        //Delete scripts in localStorage, if not equals version of app
        if(storage.version && parseFloat(storage.version) !== version && storage.map){
            _.forIn(JSON.parse(storage.map), function(object){
                _.forEach(object, function(urls){
                    _.forEach(urls, function(url){
                        localStorage.removeItem(url);
                    });
                });
            });
        }

        //Saving map and version in localStorage
        storage.version = version;
        storage.map = JSON.stringify(map);

        //forIn of modules
        _.forIn(map, function(object, module){

            //With _.after, only excetures this function the last time
            var done = _.after(_.size(object.scripts), function(module){

                //Add module to list of mods loaded, and load it !
                console.log("module loaded", module);
                modsLoaded.push(module);
                if(map[module].initOnLoad)
                    initModule(module);
            });

            loadUrls(object.scripts, module, done);
        });

        function loadUrls(urls, module, done){
            _.forEach(urls, function(url){
                if(storage[url]) done(module);
                else getScript(url, done, module);
            })
        }

        function getScript(url, done, module){
            $.get(url, function(data) {
                console.log("url load", url);
                storage[url] = data;
                done(module);
            }, 'text');//Type text, then jQuery don't try to execute it.
        }

        function initModule(name){//TODO add external visibility
            console.log('try to init module', name);

            //If the module was initiated, stop
            if(_.indexOf(modsInitiated, name) !== -1) return;

            //Is there any dependency? If answer is yes, stop.
            if(map[name].dependencies && checkModuleDependency(name)) return;

            //Add scripts to body
            _.forEach(map[name].scripts, function(url){
                var script = document.createElement('script');
                script.textContent = storage[url];
                body.appendChild(script);
            });

            if(map[name].isAngularModule)//TODO Only for one module, otherwise KABOOM!. The integration with Angular is still in progress
                angular.element(document).ready(function() {
                    console.log('isAngularModule', name);
                    angular.bootstrap(document, [name]);
                });

            console.log("module initiated", name);
            //To initiated-modules list
            modsInitiated.push(name);

            //Call the modules which have this module as dependency
            if(callbackModList[name]){
                console.log('callbackModList', name);
                _.forEach(callbackModList[name], function(module){
                    initModule(module);
                });
                delete callbackModList[name];
            }
        }

        function checkModuleDependency(name){
            var haveDependencies = false;
            var dependencies = map[name].dependencies;
            if(dependencies)
                _.forEach(dependencies, function(module){
                    if(_.indexOf(modsInitiated, module) === -1){
                        haveDependencies = true;
                        if(!callbackModList[module]) callbackModList[module] = [];
                        callbackModList[module].push(name);//Add to the list of modules to call when load finish
                        initModule(module);
                    }
                });
            return haveDependencies;
        }

    }

    window.preload = preload;
})(window);