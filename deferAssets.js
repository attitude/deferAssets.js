(function (w, html) {
    'use strict';

    // No conflict please
    if (w.DeferAssets) {
        return;
    }

    // Fallback
    if (!html) {
        html = w.document.getElementsByTagName('html')[0];
    }

    var loading = [],
        loaded = [],
        removeClass = function (htmlClass) {
            var regex = new RegExp(' ?\\b' + htmlClass + '\\b');
            html.className = html.className.replace(regex, '').trim();
        },
        addClass = function (htmlClass) {
            if (html.className.indexOf(htmlClass) < 0) {
                html.className += ' ' + htmlClass;
            }
        },
        slowInternet = false,
        triggerSlowInternetClass = function () {
            if (!slowInternet) {
                slowInternet = true;
            }

            addClass('slow-internet');
        },
        callStack = function (stack) {
            if (stack instanceof Array) {
                var i, l;
                l = stack.length;
                for (i = 0; i < l; i = i + 1) {
                    if (typeof stack[i] === 'function') {
                        stack[i]();
                    }
                }
            } else if (typeof stack === 'function') {
                stack();
            }
        },
        loadAsset = function (asset) {
            if (typeof asset !== 'object') {
                return;
            }

            loading.push(asset.name);
            addClass(asset.className);

            var delay,
                ttl = 0,
                load = function () {
                    var e, i, l, notloaded = null;

                    if (asset.require.length) {
                        l = asset.require.length;
                        for (i = 0; i < l; i = i + 1) {
                            // all must be loaded
                            if (loaded.indexOf(asset.require[i]) < 0) {
                                notloaded = asset.require[i];
                            }
                        }

                        // Maybe loading
                        if (notloaded !== null) {
                            if (ttl >= 20) {
                                triggerSlowInternetClass();

                                if (asset.error) {
                                    callStack(asset.error);
                                }

                                return;
                            }

                            if (loading.indexOf(notloaded) >= 0) {
                                delay = w.setTimeout(load, 50);
                                ttl = ttl + 1;

                                return;
                            }
                        }
                    }

                    switch (asset.tag) {
                    case 'script':
                        e = w.document.createElement("script");
                        e.src = asset.url + '?time=' + Date.now();
                        e.async = 'async';
                        e.type = asset.type;
                        break;
                    case 'style':
                        e = w.document.createElement("link");
                        e.rel = 'stylesheet';
                        e.type = 'text/css';
                        e.href = asset.url;
                        break;
                    case 'img':
                        e = w.document.createElement('img');
                        e.src = asset.url;
                        break;
                    default:
                        return;
                    }

                    w.document.body.appendChild(e);

                    if (asset.mount) {
                        callStack(asset.mount);
                    }

                    e.addEventListener('load', function () {
                        if (asset.className) {
                            removeClass(asset.className);

                            if (asset.done) {
                                callStack(asset.done);
                            }
                        }

                        loaded.push(asset.name);
                    });
                };

            load();
        },
        load = function (asset) {
            // required attribute
            if (!asset.url || (asset.condition && !asset.condition)) {
                return;
            }

            var s;

            if (!asset.type) {
                s = asset.url.replace(/.*\.(\w+)$/, '$1');

                if (!s) {
                    return;
                }

                asset.type = s;
            }

            if (!asset.name) {
                s = asset.url.replace('.min.', '.').replace(/.*\/([^\/]+)$/, '$1').replace(/[^\w]/, '-');

                if (!s) {
                    return;
                }

                asset.name = s;
            }

            if (asset.require) {
                if (typeof asset.require === 'string') {
                    asset.require = [asset.require];
                } else if (!asset.require instanceof Array) {
                    return;
                }
            } else {
                asset.require = [];
            }

            switch (asset.type) {
            case 'image/bmp':
            case 'bmp':
            case 'image/gif':
            case 'gif':
            case 'image/jpeg':
            case 'jpeg':
            case 'image/jpg':
            case 'jpg':
            case 'image/png':
            case 'png':
            case 'image/svg+xml':
            case 'svg':
            case 'image/tiff':
            case 'tiff':
            case 'tif':
            case 'image/vnd.microsoft.icon':
            case 'image/x-icon':
            case 'ico':
                asset.tag = 'img';
                asset.className = 'no-' + asset.name + '-img';
                break;

            case 'fontface':
                asset.tag = 'style';
                asset.className = 'no-' + asset.name + '-fontface';
                break;
            case 'css':
            case 'text/css':
                asset.tag = 'style';
                asset.className = 'no-' + asset.name + '-css';
                asset.className = asset.className.replace('-css-css', '-css');
                break;

            case 'application/vnd.ms-fontobject':
            case 'eot':
            case 'application/x-font-ttf':
            case 'ttf':
            case 'ttc':
            case 'font/opentype':
            case 'otf':
            case 'application/x-font-woff':
            case 'woff':
                asset.tag = 'style';
                asset.template = '???';
                return;
                //break;

            case 'text/html':
            case 'text/plain':
            case 'text/xml':
                asset.tag = 'div';
                asset.xhr = true;
                return;
                //break;

            case 'js':
            case 'javascript':
                asset.tag = 'script';
                asset.type = 'text/javascript';
                asset.className = 'no-' + asset.name + '-js';
                asset.className = asset.className.replace('-js-js', '-js');
                break;

            default:
                asset.tag = 'script';
                asset.className = 'no-' + asset.name + '-' + asset.type.replace(/[^\w]/, '');
                break;
            }

            loadAsset(asset);
        },
        api = {
            load: function (deferred) {
                var i, l;

                if (typeof deferred === 'string') {
                    load({
                        url: deferred
                    });
                } else if (deferred instanceof Array) {
                    l = deferred.length;

                    for (i = 0; i < l; i = i + 1) {
                        if (typeof deferred[i] === 'string') {
                            load({
                                url: deferred[i]
                            });
                        } else if (typeof deferred[i] === 'object') {
                            load(deferred[i]);
                        } else {
                            api.load(deferred[i]);
                        }
                    }
                } else if (typeof deferred === 'object') {
                    load(deferred);
                }
            }
        };

    w.DeferAssets = api;
}(window, window.DeferAssetsTarget || null));
