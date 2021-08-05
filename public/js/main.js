window.onGatsbyInitialClientRender = function () {
    /**
     * Main JS file for theme behaviours
     */
    // Responsive video embeds
    let videoEmbeds = ['iframe[src*="youtube.com"]', 'iframe[src*="vimeo.com"]'];
    reframe(videoEmbeds.join(','));

    // Handle main navigation menu toggling on small screens
    function menuToggleHandler(e) {
        e.preventDefault();
        document.body.classList.toggle('menu--opened');
    }

    // Handle docs navigation menu toggling on small screens
    function docsNavToggleHandler(e) {
        e.preventDefault();
        document.body.classList.toggle('docs-menu--opened');
    }

    // Handle submenu toggling
    function submenuToggleHandler(e) {
        e.preventDefault();
        this.parentNode.classList.toggle('active');
    }

    window.addMainNavigationHandlers = function () {
        const menuToggle = document.querySelectorAll('.menu-toggle');
        if (menuToggle) {
            for (let i = 0; i < menuToggle.length; i++) {
                menuToggle[i].addEventListener('click', menuToggleHandler, false);
            }
        }

        const submenuToggle = document.querySelectorAll('.submenu-toggle');
        if (submenuToggle) {
            for (let i = 0; i < submenuToggle.length; i++) {
                submenuToggle[i].addEventListener('click', submenuToggleHandler, false);
            }
        }
    };

    window.removeMainNavigationHandlers = function () {
        // Remove nav related classes on page load
        document.body.classList.remove('menu--opened');

        const menuToggle = document.querySelectorAll('.menu-toggle');
        if (menuToggle) {
            for (let i = 0; i < menuToggle.length; i++) {
                menuToggle[i].removeEventListener('click', menuToggleHandler, false);
            }
        }

        const submenuToggle = document.querySelectorAll('.submenu-toggle');
        if (submenuToggle) {
            for (let i = 0; i < submenuToggle.length; i++) {
                submenuToggle[i].removeEventListener('click', submenuToggleHandler, false);
            }
        }
    };

    window.addDocsNavigationHandlers = function () {
        const docsNavToggle = document.getElementById('docs-nav-toggle');
        if (docsNavToggle) {
            docsNavToggle.addEventListener('click', docsNavToggleHandler, false);
        }

        const docsSubmenuToggle = document.querySelectorAll('.docs-submenu-toggle');
        if (docsSubmenuToggle) {
            for (let i = 0; i < docsSubmenuToggle.length; i++) {
                docsSubmenuToggle[i].addEventListener('click', submenuToggleHandler, false);
            }
        }
    };

    window.removeDocsNavigationHandlers = function () {
        // Remove docs nav related classes on page load
        document.body.classList.remove('docs-menu--opened');

        const docsNavToggle = document.getElementById('docs-nav-toggle');
        if (docsNavToggle) {
            docsNavToggle.removeEventListener('click', docsNavToggleHandler, false);
        }

        const docsSubmenuToggle = document.querySelectorAll('.docs-submenu-toggle');
        if (docsSubmenuToggle) {
            for (let i = 0; i < docsSubmenuToggle.length; i++) {
                docsSubmenuToggle[i].removeEventListener('click', submenuToggleHandler, false);
            }
        }
    };

    window.addPageNavLinks = function () {
        const pageToc = document.getElementById('page-nav-inside');
        const pageTocContainer = document.getElementById('page-nav-link-container');

        if (pageToc && pageTocContainer) {
            const pageContent = document.querySelector('.type-docs .post-content');

            // Create in-page navigation
            const headerLinks = getHeaderLinks({
                root: pageContent
            });
            if (headerLinks.length > 0) {
                pageToc.classList.add('has-links');
                renderHeaderLinks(pageTocContainer, headerLinks);
            }

            // Scroll to anchors
            let scroll = new SmoothScroll('[data-scroll]');
            let hash = window.decodeURI(location.hash.replace('#', ''));
            if (hash !== '') {
                window.setTimeout(function () {
                    let anchor = document.getElementById(hash);
                    if (anchor) {
                        scroll.animateScroll(anchor);
                    }
                }, 0);
            }

            // Highlight current anchor
            let pageTocLinks = pageTocContainer.getElementsByTagName('a');
            if (pageTocLinks.length > 0) {
                let spy = new Gumshoe('#page-nav-inside a', {
                    nested: true,
                    nestedClass: 'active-parent'
                });
            }

            // Add link to page content headings
            let pageHeadings = getElementsByTagNames(pageContent, ['h2', 'h3']);
            for (let i = 0; i < pageHeadings.length; i++) {
                let heading = pageHeadings[i];
                if (typeof heading.id !== 'undefined' && heading.id !== '') {
                    heading.insertBefore(anchorForId(heading.id), heading.firstChild);
                }
            }

            // Copy link url
            let clipboard = new ClipboardJS('.hash-link', {
                text: function (trigger) {
                    return window.location.href.replace(window.location.hash, '') + trigger.getAttribute('href');
                }
            });
        }
    };

    window.removePageNavLinks = function () {
        const pageToc = document.getElementById('page-nav-inside');
        const pageTocContainer = document.getElementById('page-nav-link-container');

        if (pageToc && pageTocContainer) {
            pageToc.classList.remove('has-links');
            while (pageTocContainer.firstChild) {
                pageTocContainer.removeChild(pageTocContainer.firstChild);
            }
        }
    };

    function getElementsByTagNames(root, tagNames) {
        let elements = [];
        for (let i = 0; i < root.children.length; i++) {
            let element = root.children[i];
            let tagName = element.nodeName.toLowerCase();
            if (tagNames.includes(tagName)) {
                elements.push(element);
            }
            elements = elements.concat(getElementsByTagNames(element, tagNames));
        }
        return elements;
    }

    function createLinksForHeaderElements(elements) {
        let result = [];
        let stack = [
            {
                level: 0,
                children: result
            }
        ];
        let re = /^h(\d)$/;
        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];
            let tagName = element.nodeName.toLowerCase();
            let match = re.exec(tagName);
            if (!match) {
                console.warn('can not create links to non header element');
                continue;
            }
            let headerLevel = parseInt(match[1], 10);
            if (!element.id) {
                if (!element.textContent) {
                    console.warn('can not create link to element without id and without text content');
                    continue;
                }
                element.id = element.textContent
                    .toLowerCase()
                    .replace(/[^\w]+/g, '_')
                    .replace(/^_/, '')
                    .replace(/_$/, '');
            }
            let link = document.createElement('a');
            link.href = '#' + element.id;
            link.setAttribute('data-scroll', '');
            link.appendChild(document.createTextNode(element.textContent));
            let obj = {
                id: element.id,
                level: headerLevel,
                textContent: element.textContent,
                element: element,
                link: link,
                children: []
            };
            if (headerLevel > stack[stack.length - 1].level) {
                stack[stack.length - 1].children.push(obj);
                stack.push(obj);
            } else {
                while (headerLevel <= stack[stack.length - 1].level && stack.length > 1) {
                    stack.pop();
                }
                stack[stack.length - 1].children.push(obj);
                stack.push(obj);
            }
        }
        return result;
    }

    function getHeaderLinks(options = {}) {
        let tagNames = options.tagNames || ['h2', 'h3'];
        let root = options.root || document.body;
        let headerElements = getElementsByTagNames(root, tagNames);
        return createLinksForHeaderElements(headerElements);
    }

    function renderHeaderLinks(element, links) {
        if (links.length === 0) {
            return;
        }
        let ulElm = document.createElement('ul');
        for (let i = 0; i < links.length; i++) {
            let liElm = document.createElement('li');
            liElm.append(links[i].link);
            if (links[i].children.length > 0) {
                renderHeaderLinks(liElm, links[i].children);
            }
            ulElm.appendChild(liElm);
        }
        element.appendChild(ulElm);
    }

    function anchorForId(id) {
        let anchor = document.createElement('a');
        anchor.setAttribute('class', 'hash-link');
        anchor.setAttribute('data-scroll', '');
        anchor.href = '#' + id;
        anchor.innerHTML = '<span class="screen-reader-text">Copy</span>';
        return anchor;
    }

    // Syntax Highlighter
    // Prism.highlightAll();
};

//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//--------------------------------New----------------------------------
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
var e, t;
(e = window),
    (t = function () {
        return (function (e) {
            var t = {};

            function n(r) {
                if (t[r]) return t[r].exports;
                var u = (t[r] = {
                    i: r,
                    l: !1,
                    exports: {}
                });
                return e[r].call(u.exports, u, u.exports, n), (u.l = !0), u.exports;
            }
            return (
                (n.m = e),
                (n.c = t),
                (n.d = function (e, t, r) {
                    n.o(e, t) ||
                        Object.defineProperty(e, t, {
                            enumerable: !0,
                            get: r
                        });
                }),
                (n.r = function (e) {
                    'undefined' != typeof Symbol &&
                        Symbol.toStringTag &&
                        Object.defineProperty(e, Symbol.toStringTag, {
                            value: 'Module'
                        }),
                        Object.defineProperty(e, '__esModule', {
                            value: !0
                        });
                }),
                (n.t = function (e, t) {
                    if ((1 & t && (e = n(e)), 8 & t)) return e;
                    if (4 & t && 'object' == typeof e && e && e.__esModule) return e;
                    var r = Object.create(null);
                    if (
                        (n.r(r),
                        Object.defineProperty(r, 'default', {
                            enumerable: !0,
                            value: e
                        }),
                        2 & t && 'string' != typeof e)
                    )
                        for (var u in e)
                            n.d(
                                r,
                                u,
                                function (t) {
                                    return e[t];
                                }.bind(null, u)
                            );
                    return r;
                }),
                (n.n = function (e) {
                    var t =
                        e && e.__esModule
                            ? function () {
                                  return e.default;
                              }
                            : function () {
                                  return e;
                              };
                    return n.d(t, 'a', t), t;
                }),
                (n.o = function (e, t) {
                    return Object.prototype.hasOwnProperty.call(e, t);
                }),
                (n.p = '/'),
                n((n.s = 22))
            );
        })([
            ,
            ,
            function (e, t, n) {
                'use strict';
                n.d(t, 'b', function () {
                    return r;
                }),
                    n.d(t, 'a', function () {
                        return u;
                    });
                var r = '__aa-highlight__',
                    u = '__/aa-highlight__';
            },
            ,
            ,
            function (e, t, n) {
                'use strict';
                n.r(t);
                var r = n(6);
                for (var u in r)
                    ['default'].indexOf(u) < 0 &&
                        (function (e) {
                            n.d(t, e, function () {
                                return r[e];
                            });
                        })(u);
                var o = n(7);
                for (var u in o)
                    ['default'].indexOf(u) < 0 &&
                        (function (e) {
                            n.d(t, e, function () {
                                return o[e];
                            });
                        })(u);
                var i = n(8);
                for (var u in i)
                    ['default'].indexOf(u) < 0 &&
                        (function (e) {
                            n.d(t, e, function () {
                                return i[e];
                            });
                        })(u);
                var a = n(9);
                for (var u in a)
                    ['default'].indexOf(u) < 0 &&
                        (function (e) {
                            n.d(t, e, function () {
                                return a[e];
                            });
                        })(u);
                var c = n(10);
                for (var u in c)
                    ['default'].indexOf(u) < 0 &&
                        (function (e) {
                            n.d(t, e, function () {
                                return c[e];
                            });
                        })(u);
                var l = n(11);
                for (var u in l)
                    ['default'].indexOf(u) < 0 &&
                        (function (e) {
                            n.d(t, e, function () {
                                return l[e];
                            });
                        })(u);
                var s = n(12);
                for (var u in s)
                    ['default'].indexOf(u) < 0 &&
                        (function (e) {
                            n.d(t, e, function () {
                                return s[e];
                            });
                        })(u);
                var f = n(13);
                for (var u in f)
                    ['default'].indexOf(u) < 0 &&
                        (function (e) {
                            n.d(t, e, function () {
                                return f[e];
                            });
                        })(u);
                var p = n(14);
                for (var u in p)
                    ['default'].indexOf(u) < 0 &&
                        (function (e) {
                            n.d(t, e, function () {
                                return p[e];
                            });
                        })(u);
                var d = n(15);
                for (var u in d)
                    ['default'].indexOf(u) < 0 &&
                        (function (e) {
                            n.d(t, e, function () {
                                return d[e];
                            });
                        })(u);
                var v = n(16);
                for (var u in v)
                    ['default'].indexOf(u) < 0 &&
                        (function (e) {
                            n.d(t, e, function () {
                                return v[e];
                            });
                        })(u);
                var m = n(17);
                for (var u in m)
                    ['default'].indexOf(u) < 0 &&
                        (function (e) {
                            n.d(t, e, function () {
                                return m[e];
                            });
                        })(u);
                var D = n(18);
                for (var u in D)
                    ['default'].indexOf(u) < 0 &&
                        (function (e) {
                            n.d(t, e, function () {
                                return D[e];
                            });
                        })(u);
                var h = n(19);
                for (var u in h)
                    ['default'].indexOf(u) < 0 &&
                        (function (e) {
                            n.d(t, e, function () {
                                return h[e];
                            });
                        })(u);
            },
            function (e, t) {},
            function (e, t) {},
            function (e, t) {},
            function (e, t) {},
            function (e, t) {},
            function (e, t) {},
            function (e, t) {},
            function (e, t) {},
            function (e, t) {},
            function (e, t) {},
            function (e, t) {},
            function (e, t) {},
            function (e, t) {},
            function (e, t) {},
            function (e, t, n) {
                'use strict';

                function r(e, t) {
                    var n = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var r = Object.getOwnPropertySymbols(e);
                        t &&
                            (r = r.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            n.push.apply(n, r);
                    }
                    return n;
                }

                function u(e, t, n) {
                    return (
                        t in e
                            ? Object.defineProperty(e, t, {
                                  value: n,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0
                              })
                            : (e[t] = n),
                        e
                    );
                }

                function o(e, t, n) {
                    var o = t.initialState;
                    return {
                        getState: function () {
                            return o;
                        },
                        dispatch: function (i, a) {
                            var c = (function (e) {
                                for (var t = 1; t < arguments.length; t++) {
                                    var n = null != arguments[t] ? arguments[t] : {};
                                    t % 2
                                        ? r(Object(n), !0).forEach(function (t) {
                                              u(e, t, n[t]);
                                          })
                                        : Object.getOwnPropertyDescriptors
                                        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                                        : r(Object(n)).forEach(function (t) {
                                              Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                                          });
                                }
                                return e;
                            })({}, o);
                            (o = e(o, {
                                type: i,
                                props: t,
                                payload: a
                            })),
                                n({
                                    state: o,
                                    prevState: c
                                });
                        }
                    };
                }

                function i(e) {
                    return e.reduce(function (e, t) {
                        return e.concat(t);
                    }, []);
                }

                function a(e, t) {
                    var n = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var r = Object.getOwnPropertySymbols(e);
                        t &&
                            (r = r.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            n.push.apply(n, r);
                    }
                    return n;
                }

                function c(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = null != arguments[t] ? arguments[t] : {};
                        t % 2
                            ? a(Object(n), !0).forEach(function (t) {
                                  l(e, t, n[t]);
                              })
                            : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                            : a(Object(n)).forEach(function (t) {
                                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                              });
                    }
                    return e;
                }

                function l(e, t, n) {
                    return (
                        t in e
                            ? Object.defineProperty(e, t, {
                                  value: n,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0
                              })
                            : (e[t] = n),
                        e
                    );
                }

                function s(e) {
                    return 0 === e.collections.length
                        ? 0
                        : e.collections.reduce(function (e, t) {
                              return e + t.items.length;
                          }, 0);
                }
                n.d(t, 'a', function () {
                    return Yt;
                });
                var f = 0;

                function p() {
                    return 'autocomplete-'.concat(f++);
                }
                var d = function () {};

                function v(e, t) {
                    var n = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var r = Object.getOwnPropertySymbols(e);
                        t &&
                            (r = r.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            n.push.apply(n, r);
                    }
                    return n;
                }

                function m(e, t, n) {
                    return (
                        t in e
                            ? Object.defineProperty(e, t, {
                                  value: n,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0
                              })
                            : (e[t] = n),
                        e
                    );
                }

                function D(e) {
                    return (D =
                        'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                            ? function (e) {
                                  return typeof e;
                              }
                            : function (e) {
                                  return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? 'symbol' : typeof e;
                              })(e);
                }

                function h(e, t) {
                    var n = [];
                    return Promise.resolve(e(t)).then(function (e) {
                        return (
                            Array.isArray(e),
                            'The `getSources` function must return an array of sources but returned type '
                                .concat(JSON.stringify(D(e)), ':\n\n')
                                .concat(JSON.stringify(e, null, 2)),
                            Promise.all(
                                e
                                    .filter(function (e) {
                                        return Boolean(e);
                                    })
                                    .map(function (e) {
                                        if ((e.sourceId, n.includes(e.sourceId)))
                                            throw new Error('[Autocomplete] The `sourceId` '.concat(JSON.stringify(e.sourceId), ' is not unique.'));
                                        n.push(e.sourceId);
                                        var t = (function (e) {
                                            for (var t = 1; t < arguments.length; t++) {
                                                var n = null != arguments[t] ? arguments[t] : {};
                                                t % 2
                                                    ? v(Object(n), !0).forEach(function (t) {
                                                          m(e, t, n[t]);
                                                      })
                                                    : Object.getOwnPropertyDescriptors
                                                    ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                                                    : v(Object(n)).forEach(function (t) {
                                                          Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                                                      });
                                            }
                                            return e;
                                        })(
                                            {
                                                getItemInputValue: function (e) {
                                                    return e.state.query;
                                                },
                                                getItemUrl: function () {},
                                                onSelect: function (e) {
                                                    (0, e.setIsOpen)(!1);
                                                },
                                                onActive: d
                                            },
                                            e
                                        );
                                        return Promise.resolve(t);
                                    })
                            )
                        );
                    });
                }

                function y(e) {
                    return (
                        (function (e) {
                            if (Array.isArray(e)) return g(e);
                        })(e) ||
                        (function (e) {
                            if ('undefined' != typeof Symbol && Symbol.iterator in Object(e)) return Array.from(e);
                        })(e) ||
                        (function (e, t) {
                            if (e) {
                                if ('string' == typeof e) return g(e, t);
                                var n = Object.prototype.toString.call(e).slice(8, -1);
                                return (
                                    'Object' === n && e.constructor && (n = e.constructor.name),
                                    'Map' === n || 'Set' === n
                                        ? Array.from(e)
                                        : 'Arguments' === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                                        ? g(e, t)
                                        : void 0
                                );
                            }
                        })(e) ||
                        (function () {
                            throw new TypeError(
                                'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                            );
                        })()
                    );
                }

                function g(e, t) {
                    (null == t || t > e.length) && (t = e.length);
                    for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
                    return r;
                }

                function b(e, t) {
                    var n = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var r = Object.getOwnPropertySymbols(e);
                        t &&
                            (r = r.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            n.push.apply(n, r);
                    }
                    return n;
                }

                function _(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = null != arguments[t] ? arguments[t] : {};
                        t % 2
                            ? b(Object(n), !0).forEach(function (t) {
                                  O(e, t, n[t]);
                              })
                            : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                            : b(Object(n)).forEach(function (t) {
                                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                              });
                    }
                    return e;
                }

                function O(e, t, n) {
                    return (
                        t in e
                            ? Object.defineProperty(e, t, {
                                  value: n,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0
                              })
                            : (e[t] = n),
                        e
                    );
                }

                function A(e, t) {
                    var n = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var r = Object.getOwnPropertySymbols(e);
                        t &&
                            (r = r.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            n.push.apply(n, r);
                    }
                    return n;
                }

                function E(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = null != arguments[t] ? arguments[t] : {};
                        t % 2
                            ? A(Object(n), !0).forEach(function (t) {
                                  C(e, t, n[t]);
                              })
                            : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                            : A(Object(n)).forEach(function (t) {
                                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                              });
                    }
                    return e;
                }

                function C(e, t, n) {
                    return (
                        t in e
                            ? Object.defineProperty(e, t, {
                                  value: n,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0
                              })
                            : (e[t] = n),
                        e
                    );
                }

                function F(e) {
                    return (F =
                        'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                            ? function (e) {
                                  return typeof e;
                              }
                            : function (e) {
                                  return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? 'symbol' : typeof e;
                              })(e);
                }

                function P(e) {
                    return (
                        (function (e) {
                            if (Array.isArray(e)) return j(e);
                        })(e) ||
                        (function (e) {
                            if ('undefined' != typeof Symbol && Symbol.iterator in Object(e)) return Array.from(e);
                        })(e) ||
                        (function (e, t) {
                            if (e) {
                                if ('string' == typeof e) return j(e, t);
                                var n = Object.prototype.toString.call(e).slice(8, -1);
                                return (
                                    'Object' === n && e.constructor && (n = e.constructor.name),
                                    'Map' === n || 'Set' === n
                                        ? Array.from(e)
                                        : 'Arguments' === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                                        ? j(e, t)
                                        : void 0
                                );
                            }
                        })(e) ||
                        (function () {
                            throw new TypeError(
                                'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                            );
                        })()
                    );
                }

                function j(e, t) {
                    (null == t || t > e.length) && (t = e.length);
                    for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
                    return r;
                }

                function w(e, t) {
                    var n = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var r = Object.getOwnPropertySymbols(e);
                        t &&
                            (r = r.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            n.push.apply(n, r);
                    }
                    return n;
                }

                function S(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = null != arguments[t] ? arguments[t] : {};
                        t % 2
                            ? w(Object(n), !0).forEach(function (t) {
                                  B(e, t, n[t]);
                              })
                            : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                            : w(Object(n)).forEach(function (t) {
                                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                              });
                    }
                    return e;
                }

                function B(e, t, n) {
                    return (
                        t in e
                            ? Object.defineProperty(e, t, {
                                  value: n,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0
                              })
                            : (e[t] = n),
                        e
                    );
                }

                function I(e) {
                    return Boolean(e.execute);
                }

                function k(e, t) {
                    return (
                        (n = e),
                        Boolean(null == n ? void 0 : n.execute)
                            ? S(
                                  S({}, e),
                                  {},
                                  {
                                      requests: e.queries.map(function (n) {
                                          return {
                                              query: n,
                                              sourceId: t,
                                              transformResponse: e.transformResponse
                                          };
                                      })
                                  }
                              )
                            : {
                                  items: e,
                                  sourceId: t
                              }
                    );
                    var n;
                }

                function x(e) {
                    var t = e
                        .reduce(function (e, t) {
                            if (!I(t)) return e.push(t), e;
                            var n = t.searchClient,
                                r = t.execute,
                                u = t.requests,
                                o = e.find(function (e) {
                                    return I(t) && I(e) && e.searchClient === n && e.execute === r;
                                });
                            if (o) {
                                var i;
                                (i = o.items).push.apply(i, P(u));
                            } else {
                                var a = {
                                    execute: r,
                                    items: u,
                                    searchClient: n
                                };
                                e.push(a);
                            }
                            return e;
                        }, [])
                        .map(function (e) {
                            if (!I(e)) return Promise.resolve(e);
                            var t = e,
                                n = t.execute,
                                r = t.items;
                            return n({
                                searchClient: t.searchClient,
                                requests: r
                            });
                        });
                    return Promise.all(t).then(function (e) {
                        return i(e);
                    });
                }

                function N(e, t) {
                    return t.map(function (t) {
                        var n = e.filter(function (e) {
                                return e.sourceId === t.sourceId;
                            }),
                            r = n.map(function (e) {
                                return e.items;
                            }),
                            u = n[0].transformResponse,
                            o = u
                                ? u(
                                      (function (e) {
                                          var t = e.map(function (e) {
                                              var t;
                                              return E(
                                                  E({}, e),
                                                  {},
                                                  {
                                                      hits:
                                                          null === (t = e.hits) || void 0 === t
                                                              ? void 0
                                                              : t.map(function (t) {
                                                                    return E(
                                                                        E({}, t),
                                                                        {},
                                                                        {
                                                                            __autocomplete_indexName: e.index,
                                                                            __autocomplete_queryID: e.queryID
                                                                        }
                                                                    );
                                                                })
                                                  }
                                              );
                                          });
                                          return {
                                              results: t,
                                              hits: t
                                                  .map(function (e) {
                                                      return e.hits;
                                                  })
                                                  .filter(Boolean),
                                              facetHits: t
                                                  .map(function (e) {
                                                      var t;
                                                      return null === (t = e.facetHits) || void 0 === t
                                                          ? void 0
                                                          : t.map(function (e) {
                                                                return {
                                                                    label: e.value,
                                                                    count: e.count,
                                                                    _highlightResult: {
                                                                        label: {
                                                                            value: e.highlighted
                                                                        }
                                                                    }
                                                                };
                                                            });
                                                  })
                                                  .filter(Boolean)
                                          };
                                      })(r)
                                  )
                                : r;
                        return (
                            Array.isArray(o),
                            'The `getItems` function from source "'
                                .concat(t.sourceId, '" must return an array of items but returned type ')
                                .concat(JSON.stringify(F(o)), ':\n\n')
                                .concat(
                                    JSON.stringify(o, null, 2),
                                    '.\n\nSee: https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/sources/#param-getitems'
                                ),
                            o.every(Boolean),
                            'The `getItems` function from source "'
                                .concat(t.sourceId, '" must return an array of items but returned ')
                                .concat(
                                    JSON.stringify(void 0),
                                    '.\n\nDid you forget to return items?\n\nSee: https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/sources/#param-getitems'
                                ),
                            {
                                source: t,
                                items: o
                            }
                        );
                    });
                }

                function T(e) {
                    var t = (function (e) {
                        var t = e.collections
                            .map(function (e) {
                                return e.items.length;
                            })
                            .reduce(function (e, t, n) {
                                var r = (e[n - 1] || 0) + t;
                                return e.push(r), e;
                            }, [])
                            .reduce(function (t, n) {
                                return n <= e.activeItemId ? t + 1 : t;
                            }, 0);
                        return e.collections[t];
                    })(e);
                    if (!t) return null;
                    var n =
                            t.items[
                                (function (e) {
                                    for (var t = e.state, n = e.collection, r = !1, u = 0, o = 0; !1 === r; ) {
                                        var i = t.collections[u];
                                        if (i === n) {
                                            r = !0;
                                            break;
                                        }
                                        (o += i.items.length), u++;
                                    }
                                    return t.activeItemId - o;
                                })({
                                    state: e,
                                    collection: t
                                })
                            ],
                        r = t.source;
                    return {
                        item: n,
                        itemInputValue: r.getItemInputValue({
                            item: n,
                            state: e
                        }),
                        itemUrl: r.getItemUrl({
                            item: n,
                            state: e
                        }),
                        source: r
                    };
                }

                function q(e, t) {
                    var n = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var r = Object.getOwnPropertySymbols(e);
                        t &&
                            (r = r.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            n.push.apply(n, r);
                    }
                    return n;
                }

                function R(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = null != arguments[t] ? arguments[t] : {};
                        t % 2
                            ? q(Object(n), !0).forEach(function (t) {
                                  L(e, t, n[t]);
                              })
                            : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                            : q(Object(n)).forEach(function (t) {
                                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                              });
                    }
                    return e;
                }

                function L(e, t, n) {
                    return (
                        t in e
                            ? Object.defineProperty(e, t, {
                                  value: n,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0
                              })
                            : (e[t] = n),
                        e
                    );
                }

                function M(e, t) {
                    if (null == e) return {};
                    var n,
                        r,
                        u = (function (e, t) {
                            if (null == e) return {};
                            var n,
                                r,
                                u = {},
                                o = Object.keys(e);
                            for (r = 0; r < o.length; r++) (n = o[r]), t.indexOf(n) >= 0 || (u[n] = e[n]);
                            return u;
                        })(e, t);
                    if (Object.getOwnPropertySymbols) {
                        var o = Object.getOwnPropertySymbols(e);
                        for (r = 0; r < o.length; r++) (n = o[r]), t.indexOf(n) >= 0 || (Object.prototype.propertyIsEnumerable.call(e, n) && (u[n] = e[n]));
                    }
                    return u;
                }
                var U = null;

                function H(e) {
                    var t = e.event,
                        n = e.nextState,
                        r = void 0 === n ? {} : n,
                        u = e.props,
                        o = e.query,
                        i = e.refresh,
                        a = e.store,
                        c = M(e, ['event', 'nextState', 'props', 'query', 'refresh', 'store']);
                    U && u.environment.clearTimeout(U);
                    var l,
                        s = c.setCollections,
                        f = c.setIsOpen,
                        p = c.setQuery,
                        d = c.setActiveItemId,
                        v = c.setStatus;
                    return (
                        p(o),
                        d(u.defaultActiveItemId),
                        o || !1 !== u.openOnFocus
                            ? (v('loading'),
                              (U = u.environment.setTimeout(function () {
                                  v('stalled');
                              }, u.stallThreshold)),
                              u
                                  .getSources(
                                      R(
                                          {
                                              query: o,
                                              refresh: i,
                                              state: a.getState()
                                          },
                                          c
                                      )
                                  )
                                  .then(function (e) {
                                      return (
                                          v('loading'),
                                          Promise.all(
                                              e.map(function (e) {
                                                  return Promise.resolve(
                                                      e.getItems(
                                                          R(
                                                              {
                                                                  query: o,
                                                                  refresh: i,
                                                                  state: a.getState()
                                                              },
                                                              c
                                                          )
                                                      )
                                                  ).then(function (t) {
                                                      return k(t, e.sourceId);
                                                  });
                                              })
                                          )
                                              .then(x)
                                              .then(function (t) {
                                                  return N(t, e);
                                              })
                                              .then(function (e) {
                                                  var n;
                                                  v('idle'), s(e);
                                                  var l = u.shouldPanelOpen({
                                                      state: a.getState()
                                                  });
                                                  f(null !== (n = r.isOpen) && void 0 !== n ? n : (u.openOnFocus && !o && l) || l);
                                                  var p = T(a.getState());
                                                  if (null !== a.getState().activeItemId && p) {
                                                      var d = p.item,
                                                          m = p.itemInputValue,
                                                          D = p.itemUrl,
                                                          h = p.source;
                                                      h.onActive(
                                                          R(
                                                              {
                                                                  event: t,
                                                                  item: d,
                                                                  itemInputValue: m,
                                                                  itemUrl: D,
                                                                  refresh: i,
                                                                  source: h,
                                                                  state: a.getState()
                                                              },
                                                              c
                                                          )
                                                      );
                                                  }
                                              })
                                              .finally(function () {
                                                  U && u.environment.clearTimeout(U);
                                              })
                                      );
                                  }))
                            : (v('idle'),
                              s(
                                  a.getState().collections.map(function (e) {
                                      return R(
                                          R({}, e),
                                          {},
                                          {
                                              items: []
                                          }
                                      );
                                  })
                              ),
                              f(
                                  null !== (l = r.isOpen) && void 0 !== l
                                      ? l
                                      : u.shouldPanelOpen({
                                            state: a.getState()
                                        })
                              ),
                              Promise.resolve())
                    );
                }

                function W(e, t) {
                    var n = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var r = Object.getOwnPropertySymbols(e);
                        t &&
                            (r = r.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            n.push.apply(n, r);
                    }
                    return n;
                }

                function V(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = null != arguments[t] ? arguments[t] : {};
                        t % 2
                            ? W(Object(n), !0).forEach(function (t) {
                                  J(e, t, n[t]);
                              })
                            : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                            : W(Object(n)).forEach(function (t) {
                                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                              });
                    }
                    return e;
                }

                function J(e, t, n) {
                    return (
                        t in e
                            ? Object.defineProperty(e, t, {
                                  value: n,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0
                              })
                            : (e[t] = n),
                        e
                    );
                }

                function Q(e, t) {
                    if (null == e) return {};
                    var n,
                        r,
                        u = (function (e, t) {
                            if (null == e) return {};
                            var n,
                                r,
                                u = {},
                                o = Object.keys(e);
                            for (r = 0; r < o.length; r++) (n = o[r]), t.indexOf(n) >= 0 || (u[n] = e[n]);
                            return u;
                        })(e, t);
                    if (Object.getOwnPropertySymbols) {
                        var o = Object.getOwnPropertySymbols(e);
                        for (r = 0; r < o.length; r++) (n = o[r]), t.indexOf(n) >= 0 || (Object.prototype.propertyIsEnumerable.call(e, n) && (u[n] = e[n]));
                    }
                    return u;
                }

                function $(e, t) {
                    return e === t || e.contains(t);
                }

                function z(e, t) {
                    var n = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var r = Object.getOwnPropertySymbols(e);
                        t &&
                            (r = r.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            n.push.apply(n, r);
                    }
                    return n;
                }

                function K(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = null != arguments[t] ? arguments[t] : {};
                        t % 2
                            ? z(Object(n), !0).forEach(function (t) {
                                  G(e, t, n[t]);
                              })
                            : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                            : z(Object(n)).forEach(function (t) {
                                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                              });
                    }
                    return e;
                }

                function G(e, t, n) {
                    return (
                        t in e
                            ? Object.defineProperty(e, t, {
                                  value: n,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0
                              })
                            : (e[t] = n),
                        e
                    );
                }

                function X(e, t) {
                    if (null == e) return {};
                    var n,
                        r,
                        u = (function (e, t) {
                            if (null == e) return {};
                            var n,
                                r,
                                u = {},
                                o = Object.keys(e);
                            for (r = 0; r < o.length; r++) (n = o[r]), t.indexOf(n) >= 0 || (u[n] = e[n]);
                            return u;
                        })(e, t);
                    if (Object.getOwnPropertySymbols) {
                        var o = Object.getOwnPropertySymbols(e);
                        for (r = 0; r < o.length; r++) (n = o[r]), t.indexOf(n) >= 0 || (Object.prototype.propertyIsEnumerable.call(e, n) && (u[n] = e[n]));
                    }
                    return u;
                }

                function Y(e) {
                    var t = e.props,
                        n = e.refresh,
                        r = e.store,
                        u = X(e, ['props', 'refresh', 'store']);
                    return {
                        getEnvironmentProps: function (e) {
                            var n = e.inputElement,
                                u = e.formElement,
                                o = e.panelElement;
                            return K(
                                {
                                    onTouchStart: function (e) {
                                        !1 !== r.getState().isOpen &&
                                            e.target !== n &&
                                            !1 ===
                                                [u, o].some(function (n) {
                                                    return $(n, e.target) || $(n, t.environment.document.activeElement);
                                                }) &&
                                            r.dispatch('blur', null);
                                    },
                                    onTouchMove: function (e) {
                                        !1 !== r.getState().isOpen && n === t.environment.document.activeElement && e.target !== n && n.blur();
                                    }
                                },
                                X(e, ['inputElement', 'formElement', 'panelElement'])
                            );
                        },
                        getRootProps: function (e) {
                            return K(
                                {
                                    role: 'combobox',
                                    'aria-expanded': r.getState().isOpen,
                                    'aria-haspopup': 'listbox',
                                    'aria-owns': r.getState().isOpen ? ''.concat(t.id, '-list') : void 0,
                                    'aria-labelledby': ''.concat(t.id, '-label')
                                },
                                e
                            );
                        },
                        getFormProps: function (e) {
                            return (
                                e.inputElement,
                                K(
                                    {
                                        action: '',
                                        noValidate: !0,
                                        role: 'search',
                                        onSubmit: function (o) {
                                            var i;
                                            o.preventDefault(),
                                                t.onSubmit(
                                                    K(
                                                        {
                                                            event: o,
                                                            refresh: n,
                                                            state: r.getState()
                                                        },
                                                        u
                                                    )
                                                ),
                                                r.dispatch('submit', null),
                                                null === (i = e.inputElement) || void 0 === i || i.blur();
                                        },
                                        onReset: function (o) {
                                            var i;
                                            o.preventDefault(),
                                                t.onReset(
                                                    K(
                                                        {
                                                            event: o,
                                                            refresh: n,
                                                            state: r.getState()
                                                        },
                                                        u
                                                    )
                                                ),
                                                r.dispatch('reset', null),
                                                null === (i = e.inputElement) || void 0 === i || i.focus();
                                        }
                                    },
                                    X(e, ['inputElement'])
                                )
                            );
                        },
                        getLabelProps: function (e) {
                            return K(
                                {
                                    htmlFor: ''.concat(t.id, '-input'),
                                    id: ''.concat(t.id, '-label')
                                },
                                e
                            );
                        },
                        getInputProps: function (e) {
                            function o(e) {
                                (t.openOnFocus || Boolean(r.getState().query)) &&
                                    H(
                                        K(
                                            {
                                                event: e,
                                                props: t,
                                                query: r.getState().completion || r.getState().query,
                                                refresh: n,
                                                store: r
                                            },
                                            u
                                        )
                                    ),
                                    r.dispatch('focus', null);
                            }
                            var i = 'ontouchstart' in t.environment,
                                a = e || {},
                                c = (a.inputElement, a.maxLength),
                                l = void 0 === c ? 512 : c,
                                s = X(a, ['inputElement', 'maxLength']),
                                f = T(r.getState());
                            return K(
                                {
                                    'aria-autocomplete': 'both',
                                    'aria-activedescendant':
                                        r.getState().isOpen && null !== r.getState().activeItemId
                                            ? ''.concat(t.id, '-item-').concat(r.getState().activeItemId)
                                            : void 0,
                                    'aria-controls': r.getState().isOpen ? ''.concat(t.id, '-list') : void 0,
                                    'aria-labelledby': ''.concat(t.id, '-label'),
                                    value: r.getState().completion || r.getState().query,
                                    id: ''.concat(t.id, '-input'),
                                    autoComplete: 'off',
                                    autoCorrect: 'off',
                                    autoCapitalize: 'off',
                                    enterKeyHint: null != f && f.itemUrl ? 'go' : 'search',
                                    spellCheck: 'false',
                                    autoFocus: t.autoFocus,
                                    placeholder: t.placeholder,
                                    maxLength: l,
                                    type: 'search',
                                    onChange: function (e) {
                                        H(
                                            K(
                                                {
                                                    event: e,
                                                    props: t,
                                                    query: e.currentTarget.value.slice(0, l),
                                                    refresh: n,
                                                    store: r
                                                },
                                                u
                                            )
                                        );
                                    },
                                    onKeyDown: function (e) {
                                        !(function (e) {
                                            var t = e.event,
                                                n = e.props,
                                                r = e.refresh,
                                                u = e.store,
                                                o = Q(e, ['event', 'props', 'refresh', 'store']);
                                            if ('ArrowUp' === t.key || 'ArrowDown' === t.key) {
                                                var i = function () {
                                                        var e = n.environment.document.getElementById(
                                                            ''.concat(n.id, '-item-').concat(u.getState().activeItemId)
                                                        );
                                                        e && (e.scrollIntoViewIfNeeded ? e.scrollIntoViewIfNeeded(!1) : e.scrollIntoView(!1));
                                                    },
                                                    a = function () {
                                                        var e = T(u.getState());
                                                        if (null !== u.getState().activeItemId && e) {
                                                            var n = e.item,
                                                                i = e.itemInputValue,
                                                                a = e.itemUrl,
                                                                c = e.source;
                                                            c.onActive(
                                                                V(
                                                                    {
                                                                        event: t,
                                                                        item: n,
                                                                        itemInputValue: i,
                                                                        itemUrl: a,
                                                                        refresh: r,
                                                                        source: c,
                                                                        state: u.getState()
                                                                    },
                                                                    o
                                                                )
                                                            );
                                                        }
                                                    };
                                                t.preventDefault(),
                                                    !1 === u.getState().isOpen && (n.openOnFocus || Boolean(u.getState().query))
                                                        ? H(
                                                              V(
                                                                  {
                                                                      event: t,
                                                                      props: n,
                                                                      query: u.getState().query,
                                                                      refresh: r,
                                                                      store: u
                                                                  },
                                                                  o
                                                              )
                                                          ).then(function () {
                                                              u.dispatch(t.key, {
                                                                  nextActiveItemId: n.defaultActiveItemId
                                                              }),
                                                                  a(),
                                                                  setTimeout(i, 0);
                                                          })
                                                        : (u.dispatch(t.key, {}), a(), i());
                                            } else if ('Escape' === t.key) t.preventDefault(), u.dispatch(t.key, null);
                                            else if ('Enter' === t.key) {
                                                if (
                                                    null === u.getState().activeItemId ||
                                                    u.getState().collections.every(function (e) {
                                                        return 0 === e.items.length;
                                                    })
                                                )
                                                    return;
                                                t.preventDefault();
                                                var c = T(u.getState()),
                                                    l = c.item,
                                                    s = c.itemInputValue,
                                                    f = c.itemUrl,
                                                    p = c.source;
                                                if (t.metaKey || t.ctrlKey)
                                                    void 0 !== f &&
                                                        (p.onSelect(
                                                            V(
                                                                {
                                                                    event: t,
                                                                    item: l,
                                                                    itemInputValue: s,
                                                                    itemUrl: f,
                                                                    refresh: r,
                                                                    source: p,
                                                                    state: u.getState()
                                                                },
                                                                o
                                                            )
                                                        ),
                                                        n.navigator.navigateNewTab({
                                                            itemUrl: f,
                                                            item: l,
                                                            state: u.getState()
                                                        }));
                                                else if (t.shiftKey)
                                                    void 0 !== f &&
                                                        (p.onSelect(
                                                            V(
                                                                {
                                                                    event: t,
                                                                    item: l,
                                                                    itemInputValue: s,
                                                                    itemUrl: f,
                                                                    refresh: r,
                                                                    source: p,
                                                                    state: u.getState()
                                                                },
                                                                o
                                                            )
                                                        ),
                                                        n.navigator.navigateNewWindow({
                                                            itemUrl: f,
                                                            item: l,
                                                            state: u.getState()
                                                        }));
                                                else if (t.altKey);
                                                else {
                                                    if (void 0 !== f)
                                                        return (
                                                            p.onSelect(
                                                                V(
                                                                    {
                                                                        event: t,
                                                                        item: l,
                                                                        itemInputValue: s,
                                                                        itemUrl: f,
                                                                        refresh: r,
                                                                        source: p,
                                                                        state: u.getState()
                                                                    },
                                                                    o
                                                                )
                                                            ),
                                                            void n.navigator.navigate({
                                                                itemUrl: f,
                                                                item: l,
                                                                state: u.getState()
                                                            })
                                                        );
                                                    H(
                                                        V(
                                                            {
                                                                event: t,
                                                                nextState: {
                                                                    isOpen: !1
                                                                },
                                                                props: n,
                                                                query: s,
                                                                refresh: r,
                                                                store: u
                                                            },
                                                            o
                                                        )
                                                    ).then(function () {
                                                        p.onSelect(
                                                            V(
                                                                {
                                                                    event: t,
                                                                    item: l,
                                                                    itemInputValue: s,
                                                                    itemUrl: f,
                                                                    refresh: r,
                                                                    source: p,
                                                                    state: u.getState()
                                                                },
                                                                o
                                                            )
                                                        );
                                                    });
                                                }
                                            }
                                        })(
                                            K(
                                                {
                                                    event: e,
                                                    props: t,
                                                    refresh: n,
                                                    store: r
                                                },
                                                u
                                            )
                                        );
                                    },
                                    onFocus: o,
                                    onBlur: function () {
                                        i || r.dispatch('blur', null);
                                    },
                                    onClick: function (n) {
                                        e.inputElement !== t.environment.document.activeElement || r.getState().isOpen || o(n);
                                    }
                                },
                                s
                            );
                        },
                        getPanelProps: function (e) {
                            return K(
                                {
                                    onMouseDown: function (e) {
                                        e.preventDefault();
                                    },
                                    onMouseLeave: function () {
                                        r.dispatch('mouseleave', null);
                                    }
                                },
                                e
                            );
                        },
                        getListProps: function (e) {
                            return K(
                                {
                                    role: 'listbox',
                                    'aria-labelledby': ''.concat(t.id, '-label'),
                                    id: ''.concat(t.id, '-list')
                                },
                                e
                            );
                        },
                        getItemProps: function (e) {
                            var o = e.item,
                                i = e.source,
                                a = X(e, ['item', 'source']);
                            return K(
                                {
                                    id: ''.concat(t.id, '-item-').concat(o.__autocomplete_id),
                                    role: 'option',
                                    'aria-selected': r.getState().activeItemId === o.__autocomplete_id,
                                    onMouseMove: function (e) {
                                        if (o.__autocomplete_id !== r.getState().activeItemId) {
                                            r.dispatch('mousemove', o.__autocomplete_id);
                                            var t = T(r.getState());
                                            if (null !== r.getState().activeItemId && t) {
                                                var i = t.item,
                                                    a = t.itemInputValue,
                                                    c = t.itemUrl,
                                                    l = t.source;
                                                l.onActive(
                                                    K(
                                                        {
                                                            event: e,
                                                            item: i,
                                                            itemInputValue: a,
                                                            itemUrl: c,
                                                            refresh: n,
                                                            source: l,
                                                            state: r.getState()
                                                        },
                                                        u
                                                    )
                                                );
                                            }
                                        }
                                    },
                                    onMouseDown: function (e) {
                                        e.preventDefault();
                                    },
                                    onClick: function (e) {
                                        var a = i.getItemInputValue({
                                                item: o,
                                                state: r.getState()
                                            }),
                                            c = i.getItemUrl({
                                                item: o,
                                                state: r.getState()
                                            });
                                        (c
                                            ? Promise.resolve()
                                            : H(
                                                  K(
                                                      {
                                                          event: e,
                                                          nextState: {
                                                              isOpen: !1
                                                          },
                                                          props: t,
                                                          query: a,
                                                          refresh: n,
                                                          store: r
                                                      },
                                                      u
                                                  )
                                              )
                                        ).then(function () {
                                            i.onSelect(
                                                K(
                                                    {
                                                        event: e,
                                                        item: o,
                                                        itemInputValue: a,
                                                        itemUrl: c,
                                                        refresh: n,
                                                        source: i,
                                                        state: r.getState()
                                                    },
                                                    u
                                                )
                                            );
                                        });
                                    }
                                },
                                a
                            );
                        }
                    };
                }

                function Z(e) {
                    var t,
                        n = e.state;
                    return !1 === n.isOpen || null === n.activeItemId ? null : (null === (t = T(n)) || void 0 === t ? void 0 : t.itemInputValue) || null;
                }

                function ee(e, t, n, r) {
                    if (!n) return null;
                    if (e < 0 && (null === t || (null !== r && 0 === t))) return n + e;
                    var u = (null === t ? -1 : t) + e;
                    return u <= -1 || u >= n ? (null === r ? null : 0) : u;
                }

                function te(e, t) {
                    var n = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var r = Object.getOwnPropertySymbols(e);
                        t &&
                            (r = r.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            n.push.apply(n, r);
                    }
                    return n;
                }

                function ne(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = null != arguments[t] ? arguments[t] : {};
                        t % 2
                            ? te(Object(n), !0).forEach(function (t) {
                                  re(e, t, n[t]);
                              })
                            : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                            : te(Object(n)).forEach(function (t) {
                                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                              });
                    }
                    return e;
                }

                function re(e, t, n) {
                    return (
                        t in e
                            ? Object.defineProperty(e, t, {
                                  value: n,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0
                              })
                            : (e[t] = n),
                        e
                    );
                }
                var ue = function (e, t) {
                    switch (t.type) {
                        case 'setActiveItemId':
                            return ne(
                                ne({}, e),
                                {},
                                {
                                    activeItemId: t.payload
                                }
                            );
                        case 'setQuery':
                            return ne(
                                ne({}, e),
                                {},
                                {
                                    query: t.payload,
                                    completion: null
                                }
                            );
                        case 'setCollections':
                            return ne(
                                ne({}, e),
                                {},
                                {
                                    collections: t.payload
                                }
                            );
                        case 'setIsOpen':
                            return ne(
                                ne({}, e),
                                {},
                                {
                                    isOpen: t.payload
                                }
                            );
                        case 'setStatus':
                            return ne(
                                ne({}, e),
                                {},
                                {
                                    status: t.payload
                                }
                            );
                        case 'setContext':
                            return ne(
                                ne({}, e),
                                {},
                                {
                                    context: ne(ne({}, e.context), t.payload)
                                }
                            );
                        case 'ArrowDown':
                            var n = ne(
                                ne({}, e),
                                {},
                                {
                                    activeItemId: t.payload.hasOwnProperty('nextActiveItemId')
                                        ? t.payload.nextActiveItemId
                                        : ee(1, e.activeItemId, s(e), t.props.defaultActiveItemId)
                                }
                            );
                            return ne(
                                ne({}, n),
                                {},
                                {
                                    completion: Z({
                                        state: n
                                    })
                                }
                            );
                        case 'ArrowUp':
                            var r = ne(
                                ne({}, e),
                                {},
                                {
                                    activeItemId: ee(-1, e.activeItemId, s(e), t.props.defaultActiveItemId)
                                }
                            );
                            return ne(
                                ne({}, r),
                                {},
                                {
                                    completion: Z({
                                        state: r
                                    })
                                }
                            );
                        case 'Escape':
                            return e.isOpen
                                ? ne(
                                      ne({}, e),
                                      {},
                                      {
                                          activeItemId: null,
                                          isOpen: !1,
                                          completion: null
                                      }
                                  )
                                : ne(
                                      ne({}, e),
                                      {},
                                      {
                                          activeItemId: null,
                                          query: '',
                                          status: 'idle',
                                          collections: []
                                      }
                                  );
                        case 'submit':
                            return ne(
                                ne({}, e),
                                {},
                                {
                                    activeItemId: null,
                                    isOpen: !1,
                                    status: 'idle'
                                }
                            );
                        case 'reset':
                            return ne(
                                ne({}, e),
                                {},
                                {
                                    activeItemId: !0 === t.props.openOnFocus ? t.props.defaultActiveItemId : null,
                                    status: 'idle',
                                    query: ''
                                }
                            );
                        case 'focus':
                            return ne(
                                ne({}, e),
                                {},
                                {
                                    activeItemId: t.props.defaultActiveItemId,
                                    isOpen:
                                        (t.props.openOnFocus || Boolean(e.query)) &&
                                        t.props.shouldPanelOpen({
                                            state: e
                                        })
                                }
                            );
                        case 'blur':
                            return t.props.debug
                                ? e
                                : ne(
                                      ne({}, e),
                                      {},
                                      {
                                          isOpen: !1,
                                          activeItemId: null
                                      }
                                  );
                        case 'mousemove':
                            return ne(
                                ne({}, e),
                                {},
                                {
                                    activeItemId: t.payload
                                }
                            );
                        case 'mouseleave':
                            return ne(
                                ne({}, e),
                                {},
                                {
                                    activeItemId: t.props.defaultActiveItemId
                                }
                            );
                        default:
                            return 'The reducer action '.concat(JSON.stringify(t.type), ' is not supported.'), e;
                    }
                };

                function oe(e, t) {
                    var n = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var r = Object.getOwnPropertySymbols(e);
                        t &&
                            (r = r.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            n.push.apply(n, r);
                    }
                    return n;
                }

                function ie(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = null != arguments[t] ? arguments[t] : {};
                        t % 2
                            ? oe(Object(n), !0).forEach(function (t) {
                                  ae(e, t, n[t]);
                              })
                            : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                            : oe(Object(n)).forEach(function (t) {
                                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                              });
                    }
                    return e;
                }

                function ae(e, t, n) {
                    return (
                        t in e
                            ? Object.defineProperty(e, t, {
                                  value: n,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0
                              })
                            : (e[t] = n),
                        e
                    );
                }

                function ce(e) {
                    var t = [],
                        n = (function (e, t) {
                            var n,
                                r = 'undefined' != typeof window ? window : {},
                                u = e.plugins || [];
                            return _(
                                _(
                                    {
                                        debug: !1,
                                        openOnFocus: !1,
                                        placeholder: '',
                                        autoFocus: !1,
                                        defaultActiveItemId: null,
                                        stallThreshold: 300,
                                        environment: r,
                                        shouldPanelOpen: function (e) {
                                            return s(e.state) > 0;
                                        }
                                    },
                                    e
                                ),
                                {},
                                {
                                    id: null !== (n = e.id) && void 0 !== n ? n : p(),
                                    plugins: u,
                                    initialState: _(
                                        {
                                            activeItemId: null,
                                            query: '',
                                            completion: null,
                                            collections: [],
                                            isOpen: !1,
                                            status: 'idle',
                                            context: {}
                                        },
                                        e.initialState
                                    ),
                                    onStateChange: function (t) {
                                        var n;
                                        null === (n = e.onStateChange) || void 0 === n || n.call(e, t),
                                            u.forEach(function (e) {
                                                var n;
                                                return null === (n = e.onStateChange) || void 0 === n ? void 0 : n.call(e, t);
                                            });
                                    },
                                    onSubmit: function (t) {
                                        var n;
                                        null === (n = e.onSubmit) || void 0 === n || n.call(e, t),
                                            u.forEach(function (e) {
                                                var n;
                                                return null === (n = e.onSubmit) || void 0 === n ? void 0 : n.call(e, t);
                                            });
                                    },
                                    onReset: function (t) {
                                        var n;
                                        null === (n = e.onReset) || void 0 === n || n.call(e, t),
                                            u.forEach(function (e) {
                                                var n;
                                                return null === (n = e.onReset) || void 0 === n ? void 0 : n.call(e, t);
                                            });
                                    },
                                    getSources: function (n) {
                                        return Promise.all(
                                            []
                                                .concat(
                                                    y(
                                                        u.map(function (e) {
                                                            return e.getSources;
                                                        })
                                                    ),
                                                    [e.getSources]
                                                )
                                                .filter(Boolean)
                                                .map(function (e) {
                                                    return h(e, n);
                                                })
                                        )
                                            .then(function (e) {
                                                return i(e);
                                            })
                                            .then(function (e) {
                                                return e.map(function (e) {
                                                    return _(
                                                        _({}, e),
                                                        {},
                                                        {
                                                            onSelect: function (n) {
                                                                e.onSelect(n),
                                                                    t.forEach(function (e) {
                                                                        var t;
                                                                        return null === (t = e.onSelect) || void 0 === t ? void 0 : t.call(e, n);
                                                                    });
                                                            },
                                                            onActive: function (n) {
                                                                e.onActive(n),
                                                                    t.forEach(function (e) {
                                                                        var t;
                                                                        return null === (t = e.onActive) || void 0 === t ? void 0 : t.call(e, n);
                                                                    });
                                                            }
                                                        }
                                                    );
                                                });
                                            });
                                    },
                                    navigator: _(
                                        {
                                            navigate: function (e) {
                                                var t = e.itemUrl;
                                                r.location.assign(t);
                                            },
                                            navigateNewTab: function (e) {
                                                var t = e.itemUrl,
                                                    n = r.open(t, '_blank', 'noopener');
                                                null == n || n.focus();
                                            },
                                            navigateNewWindow: function (e) {
                                                var t = e.itemUrl;
                                                r.open(t, '_blank', 'noopener');
                                            }
                                        },
                                        e.navigator
                                    )
                                }
                            );
                        })(e, t),
                        r = o(ue, n, function (e) {
                            var t = e.prevState,
                                r = e.state;
                            n.onStateChange(
                                ie(
                                    {
                                        prevState: t,
                                        state: r,
                                        refresh: l
                                    },
                                    u
                                )
                            );
                        }),
                        u = (function (e) {
                            var t = e.store;
                            return {
                                setActiveItemId: function (e) {
                                    t.dispatch('setActiveItemId', e);
                                },
                                setQuery: function (e) {
                                    t.dispatch('setQuery', e);
                                },
                                setCollections: function (e) {
                                    var n = 0,
                                        r = e.map(function (e) {
                                            return c(
                                                c({}, e),
                                                {},
                                                {
                                                    items: i(e.items).map(function (e) {
                                                        return c(
                                                            c({}, e),
                                                            {},
                                                            {
                                                                __autocomplete_id: n++
                                                            }
                                                        );
                                                    })
                                                }
                                            );
                                        });
                                    t.dispatch('setCollections', r);
                                },
                                setIsOpen: function (e) {
                                    t.dispatch('setIsOpen', e);
                                },
                                setStatus: function (e) {
                                    t.dispatch('setStatus', e);
                                },
                                setContext: function (e) {
                                    t.dispatch('setContext', e);
                                }
                            };
                        })({
                            store: r
                        }),
                        a = Y(
                            ie(
                                {
                                    props: n,
                                    refresh: l,
                                    store: r
                                },
                                u
                            )
                        );

                    function l() {
                        return H(
                            ie(
                                {
                                    event: new Event('input'),
                                    nextState: {
                                        isOpen: r.getState().isOpen
                                    },
                                    props: n,
                                    query: r.getState().query,
                                    refresh: l,
                                    store: r
                                },
                                u
                            )
                        );
                    }
                    return (
                        n.plugins.forEach(function (e) {
                            var n;
                            return null === (n = e.subscribe) || void 0 === n
                                ? void 0
                                : n.call(
                                      e,
                                      ie(
                                          ie({}, u),
                                          {},
                                          {
                                              refresh: l,
                                              onSelect: function (e) {
                                                  t.push({
                                                      onSelect: e
                                                  });
                                              },
                                              onActive: function (e) {
                                                  t.push({
                                                      onActive: e
                                                  });
                                              }
                                          }
                                      )
                                  );
                        }),
                        ie(
                            ie(
                                {
                                    refresh: l
                                },
                                a
                            ),
                            u
                        )
                    );
                }

                function le(e) {
                    return {
                        current: e
                    };
                }

                function se(e, t) {
                    var n = void 0;
                    return function () {
                        for (var r = arguments.length, u = new Array(r), o = 0; o < r; o++) u[o] = arguments[o];
                        n && clearTimeout(n),
                            (n = setTimeout(function () {
                                return e.apply(void 0, u);
                            }, t));
                    };
                }
                var fe = function (e) {
                        var t = e.environment,
                            n = t.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        n.setAttribute('class', 'aa-SubmitIcon'),
                            n.setAttribute('viewBox', '0 0 24 24'),
                            n.setAttribute('width', '20'),
                            n.setAttribute('height', '20'),
                            n.setAttribute('fill', 'currentColor');
                        var r = t.document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        return (
                            r.setAttribute(
                                'd',
                                'M16.041 15.856c-0.034 0.026-0.067 0.055-0.099 0.087s-0.060 0.064-0.087 0.099c-1.258 1.213-2.969 1.958-4.855 1.958-1.933 0-3.682-0.782-4.95-2.050s-2.050-3.017-2.050-4.95 0.782-3.682 2.050-4.95 3.017-2.050 4.95-2.050 3.682 0.782 4.95 2.050 2.050 3.017 2.050 4.95c0 1.886-0.745 3.597-1.959 4.856zM21.707 20.293l-3.675-3.675c1.231-1.54 1.968-3.493 1.968-5.618 0-2.485-1.008-4.736-2.636-6.364s-3.879-2.636-6.364-2.636-4.736 1.008-6.364 2.636-2.636 3.879-2.636 6.364 1.008 4.736 2.636 6.364 3.879 2.636 6.364 2.636c2.125 0 4.078-0.737 5.618-1.968l3.675 3.675c0.391 0.391 1.024 0.391 1.414 0s0.391-1.024 0-1.414z'
                            ),
                            n.appendChild(r),
                            n
                        );
                    },
                    pe = function (e) {
                        var t = e.environment,
                            n = t.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        n.setAttribute('class', 'aa-ClearIcon'),
                            n.setAttribute('viewBox', '0 0 24 24'),
                            n.setAttribute('width', '18'),
                            n.setAttribute('height', '18'),
                            n.setAttribute('fill', 'currentColor');
                        var r = t.document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        return (
                            r.setAttribute(
                                'd',
                                'M5.293 6.707l5.293 5.293-5.293 5.293c-0.391 0.391-0.391 1.024 0 1.414s1.024 0.391 1.414 0l5.293-5.293 5.293 5.293c0.391 0.391 1.024 0.391 1.414 0s0.391-1.024 0-1.414l-5.293-5.293 5.293-5.293c0.391-0.391 0.391-1.024 0-1.414s-1.024-0.391-1.414 0l-5.293 5.293-5.293-5.293c-0.391-0.391-1.024-0.391-1.414 0s-0.391 1.024 0 1.414z'
                            ),
                            n.appendChild(r),
                            n
                        );
                    },
                    de = function (e) {
                        var t = e.environment.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        return (
                            t.setAttribute('class', 'aa-LoadingIcon'),
                            t.setAttribute('viewBox', '0 0 100 100'),
                            t.setAttribute('width', '20'),
                            t.setAttribute('height', '20'),
                            (t.innerHTML =
                                '<circle\n  cx="50"\n  cy="50"\n  fill="none"\n  r="35"\n  stroke="currentColor"\n  stroke-dasharray="164.93361431346415 56.97787143782138"\n  stroke-width="6"\n>\n  <animateTransform\n    attributeName="transform"\n    type="rotate"\n    repeatCount="indefinite"\n    dur="1s"\n    values="0 50 50;90 50 50;180 50 50;360 50 50"\n    keyTimes="0;0.40;0.65;1"\n  />\n</circle>'),
                            t
                        );
                    };

                function ve(e, t, n) {
                    e[t] = null === n ? '' : 'number' != typeof n ? n : n + 'px';
                }

                function me(e) {
                    this._listeners[e.type](e);
                }

                function De(e, t, n) {
                    var r,
                        u,
                        o = e[t];
                    if ('style' === t)
                        if ('string' == typeof n) e.style = n;
                        else if (null === n) e.style = '';
                        else for (t in n) (o && n[t] === o[t]) || ve(e.style, t, n[t]);
                    else
                        'o' === t[0] && 'n' === t[1]
                            ? ((r = t !== (t = t.replace(/Capture$/, ''))),
                              (u = t.toLowerCase()) in e && (t = u),
                              (t = t.slice(2)),
                              e._listeners || (e._listeners = {}),
                              (e._listeners[t] = n),
                              n ? o || e.addEventListener(t, me, r) : e.removeEventListener(t, me, r))
                            : 'list' !== t && 'tagName' !== t && 'form' !== t && 'type' !== t && 'size' !== t && 'download' !== t && 'href' !== t && t in e
                            ? (e[t] = null == n ? '' : n)
                            : 'function' != typeof n &&
                              'dangerouslySetInnerHTML' !== t &&
                              (null == n || (!1 === n && !/^ar/.test(t)) ? e.removeAttribute(t) : e.setAttribute(t, n));
                }

                function he(e) {
                    switch (e) {
                        case 'onChange':
                            return 'onInput';
                        default:
                            return e;
                    }
                }

                function ye(e, t) {
                    for (var n in t) De(e, he(n), t[n]);
                }

                function ge(e, t) {
                    for (var n in t) ('o' === n[0] && 'n' === n[1]) || De(e, he(n), t[n]);
                }

                function be(e) {
                    return (
                        (function (e) {
                            if (Array.isArray(e)) return _e(e);
                        })(e) ||
                        (function (e) {
                            if ('undefined' != typeof Symbol && Symbol.iterator in Object(e)) return Array.from(e);
                        })(e) ||
                        (function (e, t) {
                            if (e) {
                                if ('string' == typeof e) return _e(e, t);
                                var n = Object.prototype.toString.call(e).slice(8, -1);
                                return (
                                    'Object' === n && e.constructor && (n = e.constructor.name),
                                    'Map' === n || 'Set' === n
                                        ? Array.from(e)
                                        : 'Arguments' === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                                        ? _e(e, t)
                                        : void 0
                                );
                            }
                        })(e) ||
                        (function () {
                            throw new TypeError(
                                'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                            );
                        })()
                    );
                }

                function _e(e, t) {
                    (null == t || t > e.length) && (t = e.length);
                    for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
                    return r;
                }

                function Oe(e, t) {
                    if (null == e) return {};
                    var n,
                        r,
                        u = (function (e, t) {
                            if (null == e) return {};
                            var n,
                                r,
                                u = {},
                                o = Object.keys(e);
                            for (r = 0; r < o.length; r++) (n = o[r]), t.indexOf(n) >= 0 || (u[n] = e[n]);
                            return u;
                        })(e, t);
                    if (Object.getOwnPropertySymbols) {
                        var o = Object.getOwnPropertySymbols(e);
                        for (r = 0; r < o.length; r++) (n = o[r]), t.indexOf(n) >= 0 || (Object.prototype.propertyIsEnumerable.call(e, n) && (u[n] = e[n]));
                    }
                    return u;
                }

                function Ae(e) {
                    return function (t, n) {
                        var r = n.children,
                            u = void 0 === r ? [] : r,
                            o = Oe(n, ['children']),
                            i = e.document.createElement(t);
                        return ye(i, o), i.append.apply(i, be(u)), i;
                    };
                }

                function Ee(e, t) {
                    var n = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var r = Object.getOwnPropertySymbols(e);
                        t &&
                            (r = r.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            n.push.apply(n, r);
                    }
                    return n;
                }

                function Ce(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = null != arguments[t] ? arguments[t] : {};
                        t % 2
                            ? Ee(Object(n), !0).forEach(function (t) {
                                  Fe(e, t, n[t]);
                              })
                            : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                            : Ee(Object(n)).forEach(function (t) {
                                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                              });
                    }
                    return e;
                }

                function Fe(e, t, n) {
                    return (
                        t in e
                            ? Object.defineProperty(e, t, {
                                  value: n,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0
                              })
                            : (e[t] = n),
                        e
                    );
                }

                function Pe(e, t) {
                    if (null == e) return {};
                    var n,
                        r,
                        u = (function (e, t) {
                            if (null == e) return {};
                            var n,
                                r,
                                u = {},
                                o = Object.keys(e);
                            for (r = 0; r < o.length; r++) (n = o[r]), t.indexOf(n) >= 0 || (u[n] = e[n]);
                            return u;
                        })(e, t);
                    if (Object.getOwnPropertySymbols) {
                        var o = Object.getOwnPropertySymbols(e);
                        for (r = 0; r < o.length; r++) (n = o[r]), t.indexOf(n) >= 0 || (Object.prototype.propertyIsEnumerable.call(e, n) && (u[n] = e[n]));
                    }
                    return u;
                }

                function je(e, t) {
                    var n = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var r = Object.getOwnPropertySymbols(e);
                        t &&
                            (r = r.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            n.push.apply(n, r);
                    }
                    return n;
                }

                function we(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = null != arguments[t] ? arguments[t] : {};
                        t % 2
                            ? je(Object(n), !0).forEach(function (t) {
                                  Se(e, t, n[t]);
                              })
                            : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                            : je(Object(n)).forEach(function (t) {
                                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                              });
                    }
                    return e;
                }

                function Se(e, t, n) {
                    return (
                        t in e
                            ? Object.defineProperty(e, t, {
                                  value: n,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0
                              })
                            : (e[t] = n),
                        e
                    );
                }

                function Be(e) {
                    var t = e.autocomplete,
                        n = e.autocompleteScopeApi,
                        r = e.classNames,
                        u = e.environment,
                        o = e.isDetached,
                        i = e.placeholder,
                        a = void 0 === i ? 'Search' : i,
                        c = e.propGetters,
                        l = e.setIsModalOpen,
                        s = e.state,
                        f = e.translations,
                        p = Ae(u),
                        d = c.getRootProps(
                            we(
                                {
                                    state: s,
                                    props: t.getRootProps({})
                                },
                                n
                            )
                        ),
                        v = p(
                            'div',
                            we(
                                {
                                    class: r.root
                                },
                                d
                            )
                        ),
                        m = p('div', {
                            class: r.detachedContainer,
                            onMouseDown: function (e) {
                                e.stopPropagation();
                            }
                        }),
                        D = p('div', {
                            class: r.detachedOverlay,
                            children: [m],
                            onMouseDown: function () {
                                l(!1), t.setIsOpen(!1);
                            }
                        }),
                        h = c.getLabelProps(
                            we(
                                {
                                    state: s,
                                    props: t.getLabelProps({})
                                },
                                n
                            )
                        ),
                        y = p('button', {
                            class: r.submitButton,
                            type: 'submit',
                            title: f.submitButtonTitle,
                            children: [
                                fe({
                                    environment: u
                                })
                            ]
                        }),
                        g = p(
                            'label',
                            we(
                                {
                                    class: r.label,
                                    children: [y]
                                },
                                h
                            )
                        ),
                        b = p('button', {
                            class: r.clearButton,
                            type: 'reset',
                            title: f.clearButtonTitle,
                            children: [
                                pe({
                                    environment: u
                                })
                            ]
                        }),
                        _ = p('div', {
                            class: r.loadingIndicator,
                            children: [
                                de({
                                    environment: u
                                })
                            ]
                        }),
                        O = (function (e) {
                            var t = e.autocompleteScopeApi,
                                n = e.environment,
                                r = (e.classNames, e.getInputProps),
                                u = e.getInputPropsCore,
                                o = e.onDetachedEscape,
                                i = e.state,
                                a = Pe(e, [
                                    'autocompleteScopeApi',
                                    'environment',
                                    'classNames',
                                    'getInputProps',
                                    'getInputPropsCore',
                                    'onDetachedEscape',
                                    'state'
                                ]),
                                c = Ae(n)('input', a),
                                l = r(
                                    Ce(
                                        {
                                            state: i,
                                            props: u({
                                                inputElement: c
                                            }),
                                            inputElement: c
                                        },
                                        t
                                    )
                                );
                            return (
                                ye(
                                    c,
                                    Ce(
                                        Ce({}, l),
                                        {},
                                        {
                                            onKeyDown: function (e) {
                                                if (o && 'Escape' === e.key) return e.preventDefault(), void o();
                                                l.onKeyDown(e);
                                            }
                                        }
                                    )
                                ),
                                c
                            );
                        })({
                            class: r.input,
                            environment: u,
                            state: s,
                            getInputProps: c.getInputProps,
                            getInputPropsCore: t.getInputProps,
                            autocompleteScopeApi: n,
                            onDetachedEscape: o
                                ? function () {
                                      t.setIsOpen(!1), l(!1);
                                  }
                                : void 0
                        }),
                        A = p('div', {
                            class: r.inputWrapperPrefix,
                            children: [g, _]
                        }),
                        E = p('div', {
                            class: r.inputWrapperSuffix,
                            children: [b]
                        }),
                        C = p('div', {
                            class: r.inputWrapper,
                            children: [O]
                        }),
                        F = c.getFormProps(
                            we(
                                {
                                    state: s,
                                    props: t.getFormProps({
                                        inputElement: O
                                    })
                                },
                                n
                            )
                        ),
                        P = p(
                            'form',
                            we(
                                {
                                    class: r.form,
                                    children: [A, C, E]
                                },
                                F
                            )
                        ),
                        j = c.getPanelProps(
                            we(
                                {
                                    state: s,
                                    props: t.getPanelProps({})
                                },
                                n
                            )
                        ),
                        w = p(
                            'div',
                            we(
                                {
                                    class: r.panel
                                },
                                j
                            )
                        );
                    if (o) {
                        var S = p('div', {
                                class: r.detachedSearchButtonIcon,
                                children: [
                                    fe({
                                        environment: u
                                    })
                                ]
                            }),
                            B = p('div', {
                                class: r.detachedSearchButtonPlaceholder,
                                textContent: a
                            }),
                            I = p('button', {
                                class: r.detachedSearchButton,
                                onClick: function (e) {
                                    e.preventDefault(), l(!0);
                                },
                                children: [S, B]
                            }),
                            k = p('button', {
                                class: r.detachedCancelButton,
                                textContent: f.detachedCancelButtonText,
                                onClick: function () {
                                    t.setIsOpen(!1), l(!1);
                                }
                            }),
                            x = p('div', {
                                class: r.detachedFormContainer,
                                children: [P, k]
                            });
                        m.appendChild(x), v.appendChild(I);
                    } else v.appendChild(P);
                    return {
                        detachedContainer: m,
                        detachedOverlay: D,
                        inputWrapper: C,
                        input: O,
                        root: v,
                        form: P,
                        label: g,
                        submitButton: y,
                        clearButton: b,
                        loadingIndicator: _,
                        panel: w
                    };
                }
                var Ie,
                    ke,
                    xe,
                    Ne,
                    Te = {},
                    qe = [],
                    Re = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;

                function Le(e, t) {
                    for (var n in t) e[n] = t[n];
                    return e;
                }

                function Me(e) {
                    var t = e.parentNode;
                    t && t.removeChild(e);
                }

                function Ue(e, t, n) {
                    var r,
                        u,
                        o,
                        i = arguments,
                        a = {};
                    for (o in t) 'key' == o ? (r = t[o]) : 'ref' == o ? (u = t[o]) : (a[o] = t[o]);
                    if (arguments.length > 3) for (n = [n], o = 3; o < arguments.length; o++) n.push(i[o]);
                    if ((null != n && (a.children = n), 'function' == typeof e && null != e.defaultProps))
                        for (o in e.defaultProps) void 0 === a[o] && (a[o] = e.defaultProps[o]);
                    return He(e, a, r, u, null);
                }

                function He(e, t, n, r, u) {
                    var o = {
                        type: e,
                        props: t,
                        key: n,
                        ref: r,
                        __k: null,
                        __: null,
                        __b: 0,
                        __e: null,
                        __d: void 0,
                        __c: null,
                        __h: null,
                        constructor: void 0,
                        __v: null == u ? ++Ie.__v : u
                    };
                    return null != Ie.vnode && Ie.vnode(o), o;
                }

                function We(e) {
                    return e.children;
                }

                function Ve(e, t) {
                    (this.props = e), (this.context = t);
                }

                function Je(e, t) {
                    if (null == t) return e.__ ? Je(e.__, e.__.__k.indexOf(e) + 1) : null;
                    for (var n; t < e.__k.length; t++) if (null != (n = e.__k[t]) && null != n.__e) return n.__e;
                    return 'function' == typeof e.type ? Je(e) : null;
                }

                function Qe(e) {
                    var t, n;
                    if (null != (e = e.__) && null != e.__c) {
                        for (e.__e = e.__c.base = null, t = 0; t < e.__k.length; t++)
                            if (null != (n = e.__k[t]) && null != n.__e) {
                                e.__e = e.__c.base = n.__e;
                                break;
                            }
                        return Qe(e);
                    }
                }

                function $e(e) {
                    ((!e.__d && (e.__d = !0) && ke.push(e) && !ze.__r++) || Ne !== Ie.debounceRendering) && ((Ne = Ie.debounceRendering) || xe)(ze);
                }

                function ze() {
                    for (var e; (ze.__r = ke.length); )
                        (e = ke.sort(function (e, t) {
                            return e.__v.__b - t.__v.__b;
                        })),
                            (ke = []),
                            e.some(function (e) {
                                var t, n, r, u, o, i;
                                e.__d &&
                                    ((o = (u = (t = e).__v).__e),
                                    (i = t.__P) &&
                                        ((n = []),
                                        ((r = Le({}, u)).__v = u.__v + 1),
                                        nt(i, u, r, t.__n, void 0 !== i.ownerSVGElement, null != u.__h ? [o] : null, n, null == o ? Je(u) : o, u.__h),
                                        rt(n, u),
                                        u.__e != o && Qe(u)));
                            });
                }

                function Ke(e, t, n, r, u, o, i, a, c, l) {
                    var s,
                        f,
                        p,
                        d,
                        v,
                        m,
                        D,
                        h = (r && r.__k) || qe,
                        y = h.length;
                    for (n.__k = [], s = 0; s < t.length; s++)
                        if (
                            null !=
                            (d = n.__k[s] =
                                null == (d = t[s]) || 'boolean' == typeof d
                                    ? null
                                    : 'string' == typeof d || 'number' == typeof d || 'bigint' == typeof d
                                    ? He(null, d, null, null, d)
                                    : Array.isArray(d)
                                    ? He(
                                          We,
                                          {
                                              children: d
                                          },
                                          null,
                                          null,
                                          null
                                      )
                                    : d.__b > 0
                                    ? He(d.type, d.props, d.key, null, d.__v)
                                    : d)
                        ) {
                            if (((d.__ = n), (d.__b = n.__b + 1), null === (p = h[s]) || (p && d.key == p.key && d.type === p.type))) h[s] = void 0;
                            else
                                for (f = 0; f < y; f++) {
                                    if ((p = h[f]) && d.key == p.key && d.type === p.type) {
                                        h[f] = void 0;
                                        break;
                                    }
                                    p = null;
                                }
                            nt(e, d, (p = p || Te), u, o, i, a, c, l),
                                (v = d.__e),
                                (f = d.ref) && p.ref != f && (D || (D = []), p.ref && D.push(p.ref, null, d), D.push(f, d.__c || v, d)),
                                null != v
                                    ? (null == m && (m = v),
                                      'function' == typeof d.type && null != d.__k && d.__k === p.__k ? (d.__d = c = Ge(d, c, e)) : (c = Xe(e, d, p, h, v, c)),
                                      l || 'option' !== n.type ? 'function' == typeof n.type && (n.__d = c) : (e.value = ''))
                                    : c && p.__e == c && c.parentNode != e && (c = Je(p));
                        }
                    for (n.__e = m, s = y; s--; )
                        null != h[s] && ('function' == typeof n.type && null != h[s].__e && h[s].__e == n.__d && (n.__d = Je(r, s + 1)), it(h[s], h[s]));
                    if (D) for (s = 0; s < D.length; s++) ot(D[s], D[++s], D[++s]);
                }

                function Ge(e, t, n) {
                    var r, u;
                    for (r = 0; r < e.__k.length; r++)
                        (u = e.__k[r]) && ((u.__ = e), (t = 'function' == typeof u.type ? Ge(u, t, n) : Xe(n, u, u, e.__k, u.__e, t)));
                    return t;
                }

                function Xe(e, t, n, r, u, o) {
                    var i, a, c;
                    if (void 0 !== t.__d) (i = t.__d), (t.__d = void 0);
                    else if (null == n || u != o || null == u.parentNode)
                        e: if (null == o || o.parentNode !== e) e.appendChild(u), (i = null);
                        else {
                            for (a = o, c = 0; (a = a.nextSibling) && c < r.length; c += 2) if (a == u) break e;
                            e.insertBefore(u, o), (i = o);
                        }
                    return void 0 !== i ? i : u.nextSibling;
                }

                function Ye(e, t, n) {
                    '-' === t[0] ? e.setProperty(t, n) : (e[t] = null == n ? '' : 'number' != typeof n || Re.test(t) ? n : n + 'px');
                }

                function Ze(e, t, n, r, u) {
                    var o;
                    e: if ('style' === t)
                        if ('string' == typeof n) e.style.cssText = n;
                        else {
                            if (('string' == typeof r && (e.style.cssText = r = ''), r)) for (t in r) (n && t in n) || Ye(e.style, t, '');
                            if (n) for (t in n) (r && n[t] === r[t]) || Ye(e.style, t, n[t]);
                        }
                    else if ('o' === t[0] && 'n' === t[1])
                        (o = t !== (t = t.replace(/Capture$/, ''))),
                            (t = t.toLowerCase() in e ? t.toLowerCase().slice(2) : t.slice(2)),
                            e.l || (e.l = {}),
                            (e.l[t + o] = n),
                            n ? r || e.addEventListener(t, o ? tt : et, o) : e.removeEventListener(t, o ? tt : et, o);
                    else if ('dangerouslySetInnerHTML' !== t) {
                        if (u) t = t.replace(/xlink[H:h]/, 'h').replace(/sName$/, 's');
                        else if ('href' !== t && 'list' !== t && 'form' !== t && 'tabIndex' !== t && 'download' !== t && t in e)
                            try {
                                e[t] = null == n ? '' : n;
                                break e;
                            } catch (e) {}
                        'function' == typeof n || (null != n && (!1 !== n || ('a' === t[0] && 'r' === t[1])) ? e.setAttribute(t, n) : e.removeAttribute(t));
                    }
                }

                function et(e) {
                    this.l[e.type + !1](Ie.event ? Ie.event(e) : e);
                }

                function tt(e) {
                    this.l[e.type + !0](Ie.event ? Ie.event(e) : e);
                }

                function nt(e, t, n, r, u, o, i, a, c) {
                    var l,
                        s,
                        f,
                        p,
                        d,
                        v,
                        m,
                        D,
                        h,
                        y,
                        g,
                        b = t.type;
                    if (void 0 !== t.constructor) return null;
                    null != n.__h && ((c = n.__h), (a = t.__e = n.__e), (t.__h = null), (o = [a])), (l = Ie.__b) && l(t);
                    try {
                        e: if ('function' == typeof b) {
                            if (
                                ((D = t.props),
                                (h = (l = b.contextType) && r[l.__c]),
                                (y = l ? (h ? h.props.value : l.__) : r),
                                n.__c
                                    ? (m = (s = t.__c = n.__c).__ = s.__E)
                                    : ('prototype' in b && b.prototype.render
                                          ? (t.__c = s = new b(D, y))
                                          : ((t.__c = s = new Ve(D, y)), (s.constructor = b), (s.render = at)),
                                      h && h.sub(s),
                                      (s.props = D),
                                      s.state || (s.state = {}),
                                      (s.context = y),
                                      (s.__n = r),
                                      (f = s.__d = !0),
                                      (s.__h = [])),
                                null == s.__s && (s.__s = s.state),
                                null != b.getDerivedStateFromProps &&
                                    (s.__s == s.state && (s.__s = Le({}, s.__s)), Le(s.__s, b.getDerivedStateFromProps(D, s.__s))),
                                (p = s.props),
                                (d = s.state),
                                f)
                            )
                                null == b.getDerivedStateFromProps && null != s.componentWillMount && s.componentWillMount(),
                                    null != s.componentDidMount && s.__h.push(s.componentDidMount);
                            else {
                                if (
                                    (null == b.getDerivedStateFromProps && D !== p && null != s.componentWillReceiveProps && s.componentWillReceiveProps(D, y),
                                    (!s.__e && null != s.shouldComponentUpdate && !1 === s.shouldComponentUpdate(D, s.__s, y)) || t.__v === n.__v)
                                ) {
                                    (s.props = D),
                                        (s.state = s.__s),
                                        t.__v !== n.__v && (s.__d = !1),
                                        (s.__v = t),
                                        (t.__e = n.__e),
                                        (t.__k = n.__k),
                                        t.__k.forEach(function (e) {
                                            e && (e.__ = t);
                                        }),
                                        s.__h.length && i.push(s);
                                    break e;
                                }
                                null != s.componentWillUpdate && s.componentWillUpdate(D, s.__s, y),
                                    null != s.componentDidUpdate &&
                                        s.__h.push(function () {
                                            s.componentDidUpdate(p, d, v);
                                        });
                            }
                            (s.context = y),
                                (s.props = D),
                                (s.state = s.__s),
                                (l = Ie.__r) && l(t),
                                (s.__d = !1),
                                (s.__v = t),
                                (s.__P = e),
                                (l = s.render(s.props, s.state, s.context)),
                                (s.state = s.__s),
                                null != s.getChildContext && (r = Le(Le({}, r), s.getChildContext())),
                                f || null == s.getSnapshotBeforeUpdate || (v = s.getSnapshotBeforeUpdate(p, d)),
                                (g = null != l && l.type === We && null == l.key ? l.props.children : l),
                                Ke(e, Array.isArray(g) ? g : [g], t, n, r, u, o, i, a, c),
                                (s.base = t.__e),
                                (t.__h = null),
                                s.__h.length && i.push(s),
                                m && (s.__E = s.__ = null),
                                (s.__e = !1);
                        } else null == o && t.__v === n.__v ? ((t.__k = n.__k), (t.__e = n.__e)) : (t.__e = ut(n.__e, t, n, r, u, o, i, c));
                        (l = Ie.diffed) && l(t);
                    } catch (e) {
                        (t.__v = null), (c || null != o) && ((t.__e = a), (t.__h = !!c), (o[o.indexOf(a)] = null)), Ie.__e(e, t, n);
                    }
                }

                function rt(e, t) {
                    Ie.__c && Ie.__c(t, e),
                        e.some(function (t) {
                            try {
                                (e = t.__h),
                                    (t.__h = []),
                                    e.some(function (e) {
                                        e.call(t);
                                    });
                            } catch (e) {
                                Ie.__e(e, t.__v);
                            }
                        });
                }

                function ut(e, t, n, r, u, o, i, a) {
                    var c,
                        l,
                        s,
                        f,
                        p = n.props,
                        d = t.props,
                        v = t.type,
                        m = 0;
                    if (('svg' === v && (u = !0), null != o))
                        for (; m < o.length; m++)
                            if ((c = o[m]) && (c === e || (v ? c.localName == v : 3 == c.nodeType))) {
                                (e = c), (o[m] = null);
                                break;
                            }
                    if (null == e) {
                        if (null === v) return document.createTextNode(d);
                        (e = u ? document.createElementNS('http://www.w3.org/2000/svg', v) : document.createElement(v, d.is && d)), (o = null), (a = !1);
                    }
                    if (null === v) p === d || (a && e.data === d) || (e.data = d);
                    else {
                        if (((o = o && qe.slice.call(e.childNodes)), (l = (p = n.props || Te).dangerouslySetInnerHTML), (s = d.dangerouslySetInnerHTML), !a)) {
                            if (null != o) for (p = {}, f = 0; f < e.attributes.length; f++) p[e.attributes[f].name] = e.attributes[f].value;
                            (s || l) && ((s && ((l && s.__html == l.__html) || s.__html === e.innerHTML)) || (e.innerHTML = (s && s.__html) || ''));
                        }
                        if (
                            ((function (e, t, n, r, u) {
                                var o;
                                for (o in n) 'children' === o || 'key' === o || o in t || Ze(e, o, null, n[o], r);
                                for (o in t)
                                    (u && 'function' != typeof t[o]) ||
                                        'children' === o ||
                                        'key' === o ||
                                        'value' === o ||
                                        'checked' === o ||
                                        n[o] === t[o] ||
                                        Ze(e, o, t[o], n[o], r);
                            })(e, d, p, u, a),
                            s)
                        )
                            t.__k = [];
                        else if (
                            ((m = t.props.children), Ke(e, Array.isArray(m) ? m : [m], t, n, r, u && 'foreignObject' !== v, o, i, e.firstChild, a), null != o)
                        )
                            for (m = o.length; m--; ) null != o[m] && Me(o[m]);
                        a ||
                            ('value' in d && void 0 !== (m = d.value) && (m !== e.value || ('progress' === v && !m)) && Ze(e, 'value', m, p.value, !1),
                            'checked' in d && void 0 !== (m = d.checked) && m !== e.checked && Ze(e, 'checked', m, p.checked, !1));
                    }
                    return e;
                }

                function ot(e, t, n) {
                    try {
                        'function' == typeof e ? e(t) : (e.current = t);
                    } catch (e) {
                        Ie.__e(e, n);
                    }
                }

                function it(e, t, n) {
                    var r, u, o;
                    if (
                        (Ie.unmount && Ie.unmount(e),
                        (r = e.ref) && ((r.current && r.current !== e.__e) || ot(r, null, t)),
                        n || 'function' == typeof e.type || (n = null != (u = e.__e)),
                        (e.__e = e.__d = void 0),
                        null != (r = e.__c))
                    ) {
                        if (r.componentWillUnmount)
                            try {
                                r.componentWillUnmount();
                            } catch (e) {
                                Ie.__e(e, t);
                            }
                        r.base = r.__P = null;
                    }
                    if ((r = e.__k)) for (o = 0; o < r.length; o++) r[o] && it(r[o], t, n);
                    null != u && Me(u);
                }

                function at(e, t, n) {
                    return this.constructor(e, n);
                }

                function ct(e, t, n) {
                    var r, u, o;
                    Ie.__ && Ie.__(e, t),
                        (u = (r = 'function' == typeof n) ? null : (n && n.__k) || t.__k),
                        (o = []),
                        nt(
                            t,
                            (e = ((!r && n) || t).__k = Ue(We, null, [e])),
                            u || Te,
                            Te,
                            void 0 !== t.ownerSVGElement,
                            !r && n ? [n] : u ? null : t.firstChild ? qe.slice.call(t.childNodes) : null,
                            o,
                            !r && n ? n : u ? u.__e : t.firstChild,
                            r
                        ),
                        rt(o, e);
                }

                function lt(e, t) {
                    return t.reduce(function (e, t) {
                        return e && e[t];
                    }, e);
                }
                (Ie = {
                    __e: function (e, t) {
                        for (var n, r, u; (t = t.__); )
                            if ((n = t.__c) && !n.__)
                                try {
                                    if (
                                        ((r = n.constructor) && null != r.getDerivedStateFromError && (n.setState(r.getDerivedStateFromError(e)), (u = n.__d)),
                                        null != n.componentDidCatch && (n.componentDidCatch(e), (u = n.__d)),
                                        u)
                                    )
                                        return (n.__E = n);
                                } catch (t) {
                                    e = t;
                                }
                        throw e;
                    },
                    __v: 0
                }),
                    (Ve.prototype.setState = function (e, t) {
                        var n;
                        (n = null != this.__s && this.__s !== this.state ? this.__s : (this.__s = Le({}, this.state))),
                            'function' == typeof e && (e = e(Le({}, n), this.props)),
                            e && Le(n, e),
                            null != e && this.__v && (t && this.__h.push(t), $e(this));
                    }),
                    (Ve.prototype.forceUpdate = function (e) {
                        this.__v && ((this.__e = !0), e && this.__h.push(e), $e(this));
                    }),
                    (Ve.prototype.render = We),
                    (ke = []),
                    (xe = 'function' == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout),
                    (ze.__r = 0);
                var st = n(2);

                function ft(e) {
                    var t = e.highlightedValue.split(st.b),
                        n = t.shift(),
                        r = (function () {
                            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
                            return {
                                get: function () {
                                    return e;
                                },
                                add: function (t) {
                                    var n = e[e.length - 1];
                                    (null == n ? void 0 : n.isHighlighted) === t.isHighlighted
                                        ? (e[e.length - 1] = {
                                              value: n.value + t.value,
                                              isHighlighted: n.isHighlighted
                                          })
                                        : e.push(t);
                                }
                            };
                        })(
                            n
                                ? [
                                      {
                                          value: n,
                                          isHighlighted: !1
                                      }
                                  ]
                                : []
                        );
                    return (
                        t.forEach(function (e) {
                            var t = e.split(st.a);
                            r.add({
                                value: t[0],
                                isHighlighted: !0
                            }),
                                '' !== t[1] &&
                                    r.add({
                                        value: t[1],
                                        isHighlighted: !1
                                    });
                        }),
                        r.get()
                    );
                }

                function pt(e) {
                    return (
                        (function (e) {
                            if (Array.isArray(e)) return dt(e);
                        })(e) ||
                        (function (e) {
                            if ('undefined' != typeof Symbol && Symbol.iterator in Object(e)) return Array.from(e);
                        })(e) ||
                        (function (e, t) {
                            if (e) {
                                if ('string' == typeof e) return dt(e, t);
                                var n = Object.prototype.toString.call(e).slice(8, -1);
                                return (
                                    'Object' === n && e.constructor && (n = e.constructor.name),
                                    'Map' === n || 'Set' === n
                                        ? Array.from(e)
                                        : 'Arguments' === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                                        ? dt(e, t)
                                        : void 0
                                );
                            }
                        })(e) ||
                        (function () {
                            throw new TypeError(
                                'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                            );
                        })()
                    );
                }

                function dt(e, t) {
                    (null == t || t > e.length) && (t = e.length);
                    for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
                    return r;
                }

                function vt(e) {
                    var t = e.hit,
                        n = e.attribute,
                        r = Array.isArray(n) ? n : [n],
                        u = lt(t, ['_highlightResult'].concat(pt(r), ['value']));
                    return (
                        'string' != typeof u && (u = lt(t, r) || ''),
                        ft({
                            highlightedValue: u
                        })
                    );
                }
                var mt = {
                        '&amp;': '&',
                        '&lt;': '<',
                        '&gt;': '>',
                        '&quot;': '"',
                        '&#39;': "'"
                    },
                    Dt = new RegExp(/\w/i),
                    ht = /&(amp|quot|lt|gt|#39);/g,
                    yt = RegExp(ht.source);

                function gt(e, t) {
                    var n,
                        r,
                        u,
                        o = e[t],
                        i = (null === (n = e[t + 1]) || void 0 === n ? void 0 : n.isHighlighted) || !0,
                        a = (null === (r = e[t - 1]) || void 0 === r ? void 0 : r.isHighlighted) || !0;
                    return Dt.test(
                        (u = o.value) && yt.test(u)
                            ? u.replace(ht, function (e) {
                                  return mt[e];
                              })
                            : u
                    ) || a !== i
                        ? o.isHighlighted
                        : a;
                }

                function bt(e, t) {
                    var n = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var r = Object.getOwnPropertySymbols(e);
                        t &&
                            (r = r.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            n.push.apply(n, r);
                    }
                    return n;
                }

                function _t(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = null != arguments[t] ? arguments[t] : {};
                        t % 2
                            ? bt(Object(n), !0).forEach(function (t) {
                                  Ot(e, t, n[t]);
                              })
                            : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                            : bt(Object(n)).forEach(function (t) {
                                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                              });
                    }
                    return e;
                }

                function Ot(e, t, n) {
                    return (
                        t in e
                            ? Object.defineProperty(e, t, {
                                  value: n,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0
                              })
                            : (e[t] = n),
                        e
                    );
                }

                function At(e) {
                    return e.some(function (e) {
                        return e.isHighlighted;
                    })
                        ? e.map(function (t, n) {
                              return _t(
                                  _t({}, t),
                                  {},
                                  {
                                      isHighlighted: !gt(e, n)
                                  }
                              );
                          })
                        : e.map(function (e) {
                              return _t(
                                  _t({}, e),
                                  {},
                                  {
                                      isHighlighted: !1
                                  }
                              );
                          });
                }

                function Et(e) {
                    var t = e.createElement,
                        n = e.Fragment;
                    return function (e) {
                        var r,
                            u = e.hit,
                            o = e.attribute,
                            i = e.tagName,
                            a = void 0 === i ? 'mark' : i;
                        return t(
                            n,
                            {},
                            ((r = {
                                hit: u,
                                attribute: o
                            }),
                            At(vt(r))).map(function (e, n) {
                                return e.isHighlighted
                                    ? t(
                                          a,
                                          {
                                              key: n
                                          },
                                          e.value
                                      )
                                    : e.value;
                            })
                        );
                    };
                }

                function Ct(e) {
                    return (
                        (function (e) {
                            if (Array.isArray(e)) return Ft(e);
                        })(e) ||
                        (function (e) {
                            if ('undefined' != typeof Symbol && Symbol.iterator in Object(e)) return Array.from(e);
                        })(e) ||
                        (function (e, t) {
                            if (e) {
                                if ('string' == typeof e) return Ft(e, t);
                                var n = Object.prototype.toString.call(e).slice(8, -1);
                                return (
                                    'Object' === n && e.constructor && (n = e.constructor.name),
                                    'Map' === n || 'Set' === n
                                        ? Array.from(e)
                                        : 'Arguments' === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                                        ? Ft(e, t)
                                        : void 0
                                );
                            }
                        })(e) ||
                        (function () {
                            throw new TypeError(
                                'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                            );
                        })()
                    );
                }

                function Ft(e, t) {
                    (null == t || t > e.length) && (t = e.length);
                    for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
                    return r;
                }

                function Pt(e) {
                    var t = e.hit,
                        n = e.attribute,
                        r = Array.isArray(n) ? n : [n],
                        u = lt(t, ['_snippetResult'].concat(Ct(r), ['value']));
                    return (
                        'string' != typeof u && (u = lt(t, r) || ''),
                        ft({
                            highlightedValue: u
                        })
                    );
                }

                function jt(e) {
                    var t = e.createElement,
                        n = e.Fragment;
                    return function (e) {
                        var r,
                            u = e.hit,
                            o = e.attribute,
                            i = e.tagName,
                            a = void 0 === i ? 'mark' : i;
                        return t(
                            n,
                            {},
                            ((r = {
                                hit: u,
                                attribute: o
                            }),
                            At(Pt(r))).map(function (e, n) {
                                return e.isHighlighted
                                    ? t(
                                          a,
                                          {
                                              key: n
                                          },
                                          e.value
                                      )
                                    : e.value;
                            })
                        );
                    };
                }

                function wt(e) {
                    var t = e.createElement,
                        n = e.Fragment;
                    return function (e) {
                        var r = e.hit,
                            u = e.attribute,
                            o = e.tagName,
                            i = void 0 === o ? 'mark' : o;
                        return t(
                            n,
                            {},
                            Pt({
                                hit: r,
                                attribute: u
                            }).map(function (e, n) {
                                return e.isHighlighted
                                    ? t(
                                          i,
                                          {
                                              key: n
                                          },
                                          e.value
                                      )
                                    : e.value;
                            })
                        );
                    };
                }

                function St(e, t) {
                    if ('string' == typeof t) {
                        var n = e.document.querySelector(t);
                        return 'The element '.concat(JSON.stringify(t), ' is not in the document.'), n;
                    }
                    return t;
                }

                function Bt() {
                    for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++) t[n] = arguments[n];
                    return t.reduce(function (e, t) {
                        return (
                            Object.keys(t).forEach(function (n) {
                                var r = e[n],
                                    u = t[n];
                                r !== u && (e[n] = [r, u].filter(Boolean).join(' '));
                            }),
                            e
                        );
                    }, {});
                }

                function It(e, t) {
                    var n = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var r = Object.getOwnPropertySymbols(e);
                        t &&
                            (r = r.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            n.push.apply(n, r);
                    }
                    return n;
                }

                function kt(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = null != arguments[t] ? arguments[t] : {};
                        t % 2
                            ? It(Object(n), !0).forEach(function (t) {
                                  xt(e, t, n[t]);
                              })
                            : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                            : It(Object(n)).forEach(function (t) {
                                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                              });
                    }
                    return e;
                }

                function xt(e, t, n) {
                    return (
                        t in e
                            ? Object.defineProperty(e, t, {
                                  value: n,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0
                              })
                            : (e[t] = n),
                        e
                    );
                }

                function Nt(e, t) {
                    if (null == e) return {};
                    var n,
                        r,
                        u = (function (e, t) {
                            if (null == e) return {};
                            var n,
                                r,
                                u = {},
                                o = Object.keys(e);
                            for (r = 0; r < o.length; r++) (n = o[r]), t.indexOf(n) >= 0 || (u[n] = e[n]);
                            return u;
                        })(e, t);
                    if (Object.getOwnPropertySymbols) {
                        var o = Object.getOwnPropertySymbols(e);
                        for (r = 0; r < o.length; r++) (n = o[r]), t.indexOf(n) >= 0 || (Object.prototype.propertyIsEnumerable.call(e, n) && (u[n] = e[n]));
                    }
                    return u;
                }
                var Tt = {
                        clearButton: 'aa-ClearButton',
                        detachedCancelButton: 'aa-DetachedCancelButton',
                        detachedContainer: 'aa-DetachedContainer',
                        detachedFormContainer: 'aa-DetachedFormContainer',
                        detachedOverlay: 'aa-DetachedOverlay',
                        detachedSearchButton: 'aa-DetachedSearchButton',
                        detachedSearchButtonIcon: 'aa-DetachedSearchButtonIcon',
                        detachedSearchButtonPlaceholder: 'aa-DetachedSearchButtonPlaceholder',
                        form: 'aa-Form',
                        input: 'aa-Input',
                        inputWrapper: 'aa-InputWrapper',
                        inputWrapperPrefix: 'aa-InputWrapperPrefix',
                        inputWrapperSuffix: 'aa-InputWrapperSuffix',
                        item: 'aa-Item',
                        label: 'aa-Label',
                        list: 'aa-List',
                        loadingIndicator: 'aa-LoadingIndicator',
                        panel: 'aa-Panel',
                        panelLayout: 'aa-PanelLayout',
                        root: 'aa-Autocomplete',
                        source: 'aa-Source',
                        sourceFooter: 'aa-SourceFooter',
                        sourceHeader: 'aa-SourceHeader',
                        sourceNoResults: 'aa-SourceNoResults',
                        submitButton: 'aa-SubmitButton'
                    },
                    qt = function (e, t) {
                        ct(e.children, t);
                    },
                    Rt = {
                        createElement: Ue,
                        Fragment: We
                    };

                function Lt(e) {
                    var t = e.panelPlacement,
                        n = e.container,
                        r = e.form,
                        u = e.environment,
                        o = n.getBoundingClientRect(),
                        i = (u.pageYOffset || u.document.documentElement.scrollTop || u.document.body.scrollTop || 0) + o.top + o.height;
                    switch (t) {
                        case 'start':
                            return {
                                top: i,
                                left: o.left
                            };
                        case 'end':
                            return {
                                top: i,
                                right: u.document.documentElement.clientWidth - (o.left + o.width)
                            };
                        case 'full-width':
                            return {
                                top: i,
                                left: 0,
                                right: 0,
                                width: 'unset',
                                maxWidth: 'unset'
                            };
                        case 'input-wrapper-width':
                            var a = r.getBoundingClientRect();
                            return {
                                top: i,
                                left: a.left,
                                right: u.document.documentElement.clientWidth - (a.left + a.width),
                                width: 'unset',
                                maxWidth: 'unset'
                            };
                        default:
                            throw new Error('[Autocomplete] The `panelPlacement` value '.concat(JSON.stringify(t), ' is not valid.'));
                    }
                }

                function Mt() {
                    return (Mt =
                        Object.assign ||
                        function (e) {
                            for (var t = 1; t < arguments.length; t++) {
                                var n = arguments[t];
                                for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
                            }
                            return e;
                        }).apply(this, arguments);
                }

                function Ut(e, t) {
                    var n = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var r = Object.getOwnPropertySymbols(e);
                        t &&
                            (r = r.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            n.push.apply(n, r);
                    }
                    return n;
                }

                function Ht(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = null != arguments[t] ? arguments[t] : {};
                        t % 2
                            ? Ut(Object(n), !0).forEach(function (t) {
                                  Wt(e, t, n[t]);
                              })
                            : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                            : Ut(Object(n)).forEach(function (t) {
                                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                              });
                    }
                    return e;
                }

                function Wt(e, t, n) {
                    return (
                        t in e
                            ? Object.defineProperty(e, t, {
                                  value: n,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0
                              })
                            : (e[t] = n),
                        e
                    );
                }

                function Vt(e) {
                    return (
                        (function (e) {
                            if (Array.isArray(e)) return Jt(e);
                        })(e) ||
                        (function (e) {
                            if ('undefined' != typeof Symbol && Symbol.iterator in Object(e)) return Array.from(e);
                        })(e) ||
                        (function (e, t) {
                            if (e) {
                                if ('string' == typeof e) return Jt(e, t);
                                var n = Object.prototype.toString.call(e).slice(8, -1);
                                return (
                                    'Object' === n && e.constructor && (n = e.constructor.name),
                                    'Map' === n || 'Set' === n
                                        ? Array.from(e)
                                        : 'Arguments' === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                                        ? Jt(e, t)
                                        : void 0
                                );
                            }
                        })(e) ||
                        (function () {
                            throw new TypeError(
                                'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                            );
                        })()
                    );
                }

                function Jt(e, t) {
                    (null == t || t > e.length) && (t = e.length);
                    for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
                    return r;
                }

                function Qt(e) {
                    return (Qt =
                        'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                            ? function (e) {
                                  return typeof e;
                              }
                            : function (e) {
                                  return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? 'symbol' : typeof e;
                              })(e);
                }
                var $t = function (e) {
                    return e && 'object' === Qt(e);
                };

                function zt() {
                    for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++) t[n] = arguments[n];
                    return t.reduce(function (e, t) {
                        return (
                            Object.keys(t).forEach(function (n) {
                                var r = e[n],
                                    u = t[n];
                                Array.isArray(r) && Array.isArray(u) ? (e[n] = r.concat.apply(r, Vt(u))) : $t(r) && $t(u) ? (e[n] = zt(r, u)) : (e[n] = u);
                            }),
                            e
                        );
                    }, {});
                }

                function Kt(e, t) {
                    var n = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var r = Object.getOwnPropertySymbols(e);
                        t &&
                            (r = r.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            n.push.apply(n, r);
                    }
                    return n;
                }

                function Gt(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = null != arguments[t] ? arguments[t] : {};
                        t % 2
                            ? Kt(Object(n), !0).forEach(function (t) {
                                  Xt(e, t, n[t]);
                              })
                            : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                            : Kt(Object(n)).forEach(function (t) {
                                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                              });
                    }
                    return e;
                }

                function Xt(e, t, n) {
                    return (
                        t in e
                            ? Object.defineProperty(e, t, {
                                  value: n,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0
                              })
                            : (e[t] = n),
                        e
                    );
                }

                function Yt(e) {
                    var t,
                        n = (function () {
                            var e = [],
                                t = [];

                            function n(n) {
                                e.push(n);
                                var r = n();
                                t.push(r);
                            }
                            return {
                                runEffect: n,
                                cleanupEffects: function () {
                                    var e = t;
                                    (t = []),
                                        e.forEach(function (e) {
                                            e();
                                        });
                                },
                                runEffects: function () {
                                    var t = e;
                                    (e = []),
                                        t.forEach(function (e) {
                                            n(e);
                                        });
                                }
                            };
                        })(),
                        r = n.runEffect,
                        u = n.cleanupEffects,
                        o = n.runEffects,
                        i =
                            ((t = []),
                            {
                                reactive: function (e) {
                                    var n = e(),
                                        r = {
                                            _fn: e,
                                            _ref: {
                                                current: n
                                            },
                                            get value() {
                                                return this._ref.current;
                                            },
                                            set value(e) {
                                                this._ref.current = e;
                                            }
                                        };
                                    return t.push(r), r;
                                },
                                runReactives: function () {
                                    t.forEach(function (e) {
                                        e._ref.current = e._fn();
                                    });
                                }
                            }),
                        a = i.reactive,
                        c = i.runReactives,
                        l = le(!1),
                        f = le(e),
                        d = le(void 0),
                        v = a(function () {
                            return (function (e) {
                                var t,
                                    n = e.classNames,
                                    r = e.container,
                                    u = e.getEnvironmentProps,
                                    o = e.getFormProps,
                                    i = e.getInputProps,
                                    a = e.getItemProps,
                                    c = e.getLabelProps,
                                    l = e.getListProps,
                                    s = e.getPanelProps,
                                    f = e.getRootProps,
                                    d = e.panelContainer,
                                    v = e.panelPlacement,
                                    m = e.render,
                                    D = e.renderNoResults,
                                    h = e.renderer,
                                    y = e.detachedMediaQuery,
                                    g = e.components,
                                    b = e.translations,
                                    _ = Nt(e, [
                                        'classNames',
                                        'container',
                                        'getEnvironmentProps',
                                        'getFormProps',
                                        'getInputProps',
                                        'getItemProps',
                                        'getLabelProps',
                                        'getListProps',
                                        'getPanelProps',
                                        'getRootProps',
                                        'panelContainer',
                                        'panelPlacement',
                                        'render',
                                        'renderNoResults',
                                        'renderer',
                                        'detachedMediaQuery',
                                        'components',
                                        'translations'
                                    ]),
                                    O = 'undefined' != typeof window ? window : {},
                                    A = St(O, r);
                                A.tagName;
                                var E,
                                    C,
                                    F,
                                    P = null != h ? h : Rt,
                                    j = {
                                        Highlight:
                                            ((E = P),
                                            (C = E.createElement),
                                            (F = E.Fragment),
                                            function (e) {
                                                var t = e.hit,
                                                    n = e.attribute,
                                                    r = e.tagName,
                                                    u = void 0 === r ? 'mark' : r;
                                                return C(
                                                    F,
                                                    {},
                                                    vt({
                                                        hit: t,
                                                        attribute: n
                                                    }).map(function (e, t) {
                                                        return e.isHighlighted
                                                            ? C(
                                                                  u,
                                                                  {
                                                                      key: t
                                                                  },
                                                                  e.value
                                                              )
                                                            : e.value;
                                                    })
                                                );
                                            }),
                                        ReverseHighlight: Et(P),
                                        ReverseSnippet: jt(P),
                                        Snippet: wt(P)
                                    };
                                return {
                                    renderer: {
                                        classNames: Bt(Tt, null != n ? n : {}),
                                        container: A,
                                        getEnvironmentProps:
                                            null != u
                                                ? u
                                                : function (e) {
                                                      return e.props;
                                                  },
                                        getFormProps:
                                            null != o
                                                ? o
                                                : function (e) {
                                                      return e.props;
                                                  },
                                        getInputProps:
                                            null != i
                                                ? i
                                                : function (e) {
                                                      return e.props;
                                                  },
                                        getItemProps:
                                            null != a
                                                ? a
                                                : function (e) {
                                                      return e.props;
                                                  },
                                        getLabelProps:
                                            null != c
                                                ? c
                                                : function (e) {
                                                      return e.props;
                                                  },
                                        getListProps:
                                            null != l
                                                ? l
                                                : function (e) {
                                                      return e.props;
                                                  },
                                        getPanelProps:
                                            null != s
                                                ? s
                                                : function (e) {
                                                      return e.props;
                                                  },
                                        getRootProps:
                                            null != f
                                                ? f
                                                : function (e) {
                                                      return e.props;
                                                  },
                                        panelContainer: d ? St(O, d) : O.document.body,
                                        panelPlacement: null != v ? v : 'input-wrapper-width',
                                        render: null != m ? m : qt,
                                        renderNoResults: D,
                                        renderer: P,
                                        detachedMediaQuery:
                                            null != y ? y : getComputedStyle(O.document.documentElement).getPropertyValue('--aa-detached-media-query'),
                                        components: kt(kt({}, j), g),
                                        translations: kt(
                                            kt(
                                                {},
                                                {
                                                    clearButtonTitle: 'Clear',
                                                    detachedCancelButtonText: 'Cancel',
                                                    submitButtonTitle: 'Submit'
                                                }
                                            ),
                                            b
                                        )
                                    },
                                    core: kt(
                                        kt({}, _),
                                        {},
                                        {
                                            id: null !== (t = _.id) && void 0 !== t ? t : p(),
                                            environment: O
                                        }
                                    )
                                };
                            })(f.current);
                        }),
                        m = a(function () {
                            return v.value.core.environment.matchMedia(v.value.renderer.detachedMediaQuery).matches;
                        }),
                        D = a(function () {
                            return ce(
                                Gt(
                                    Gt({}, v.value.core),
                                    {},
                                    {
                                        onStateChange: function (e) {
                                            var t, n, r;
                                            (l.current = e.state.collections.some(function (e) {
                                                return e.source.templates.noResults;
                                            })),
                                                null === (t = d.current) || void 0 === t || t.call(d, e),
                                                null === (n = (r = v.value.core).onStateChange) || void 0 === n || n.call(r, e);
                                        },
                                        shouldPanelOpen:
                                            f.current.shouldPanelOpen ||
                                            function (e) {
                                                var t = e.state;
                                                if (m.value) return !0;
                                                var n = s(t) > 0;
                                                if (!v.value.core.openOnFocus && !t.query) return n;
                                                var r = Boolean(l.current || v.value.renderer.renderNoResults);
                                                return (!n && r) || n;
                                            }
                                    }
                                )
                            );
                        }),
                        h = le(
                            Gt(
                                {
                                    collections: [],
                                    completion: null,
                                    context: {},
                                    isOpen: !1,
                                    query: '',
                                    activeItemId: null,
                                    status: 'idle'
                                },
                                v.value.core.initialState
                            )
                        ),
                        y = {
                            getEnvironmentProps: v.value.renderer.getEnvironmentProps,
                            getFormProps: v.value.renderer.getFormProps,
                            getInputProps: v.value.renderer.getInputProps,
                            getItemProps: v.value.renderer.getItemProps,
                            getLabelProps: v.value.renderer.getLabelProps,
                            getListProps: v.value.renderer.getListProps,
                            getPanelProps: v.value.renderer.getPanelProps,
                            getRootProps: v.value.renderer.getRootProps
                        },
                        g = {
                            setActiveItemId: D.value.setActiveItemId,
                            setQuery: D.value.setQuery,
                            setCollections: D.value.setCollections,
                            setIsOpen: D.value.setIsOpen,
                            setStatus: D.value.setStatus,
                            setContext: D.value.setContext,
                            refresh: D.value.refresh
                        },
                        b = a(function () {
                            return Be({
                                autocomplete: D.value,
                                autocompleteScopeApi: g,
                                classNames: v.value.renderer.classNames,
                                environment: v.value.core.environment,
                                isDetached: m.value,
                                placeholder: v.value.core.placeholder,
                                propGetters: y,
                                setIsModalOpen: E,
                                state: h.current,
                                translations: v.value.renderer.translations
                            });
                        });

                    function _() {
                        ye(b.value.panel, {
                            style: m.value
                                ? {}
                                : Lt({
                                      panelPlacement: v.value.renderer.panelPlacement,
                                      container: b.value.root,
                                      form: b.value.form,
                                      environment: v.value.core.environment
                                  })
                        });
                    }

                    function O(e) {
                        h.current = e;
                        var t = {
                                autocomplete: D.value,
                                autocompleteScopeApi: g,
                                classNames: v.value.renderer.classNames,
                                components: v.value.renderer.components,
                                container: v.value.renderer.container,
                                createElement: v.value.renderer.renderer.createElement,
                                dom: b.value,
                                Fragment: v.value.renderer.renderer.Fragment,
                                panelContainer: m.value ? b.value.detachedContainer : v.value.renderer.panelContainer,
                                propGetters: y,
                                state: h.current
                            },
                            n = (!s(e) && !l.current && v.value.renderer.renderNoResults) || v.value.renderer.render;
                        !(function (e) {
                            var t = e.autocomplete,
                                n = e.autocompleteScopeApi,
                                r = e.dom,
                                u = e.propGetters,
                                o = e.state;
                            ge(
                                r.root,
                                u.getRootProps(
                                    Ht(
                                        {
                                            state: o,
                                            props: t.getRootProps({})
                                        },
                                        n
                                    )
                                )
                            ),
                                ge(
                                    r.input,
                                    u.getInputProps(
                                        Ht(
                                            {
                                                state: o,
                                                props: t.getInputProps({
                                                    inputElement: r.input
                                                }),
                                                inputElement: r.input
                                            },
                                            n
                                        )
                                    )
                                ),
                                ye(r.label, {
                                    hidden: 'stalled' === o.status
                                }),
                                ye(r.loadingIndicator, {
                                    hidden: 'stalled' !== o.status
                                }),
                                ye(r.clearButton, {
                                    hidden: !o.query
                                });
                        })(t),
                            (function (e, t) {
                                var n = t.autocomplete,
                                    r = t.autocompleteScopeApi,
                                    u = t.classNames,
                                    o = t.createElement,
                                    i = t.dom,
                                    a = t.Fragment,
                                    c = t.panelContainer,
                                    l = t.propGetters,
                                    s = t.state,
                                    f = t.components;
                                if (s.isOpen) {
                                    c.contains(i.panel) || 'loading' === s.status || c.appendChild(i.panel),
                                        i.panel.classList.toggle('aa-Panel--stalled', 'stalled' === s.status);
                                    var p = s.collections
                                            .filter(function (e) {
                                                var t = e.source,
                                                    n = e.items;
                                                return t.templates.noResults || n.length > 0;
                                            })
                                            .map(function (e, t) {
                                                var i = e.source,
                                                    c = e.items;
                                                return o(
                                                    'section',
                                                    {
                                                        key: t,
                                                        className: u.source,
                                                        'data-autocomplete-source-id': i.sourceId
                                                    },
                                                    i.templates.header &&
                                                        o(
                                                            'div',
                                                            {
                                                                className: u.sourceHeader
                                                            },
                                                            i.templates.header({
                                                                components: f,
                                                                createElement: o,
                                                                Fragment: a,
                                                                items: c,
                                                                source: i,
                                                                state: s
                                                            })
                                                        ),
                                                    i.templates.noResults && 0 === c.length
                                                        ? o(
                                                              'div',
                                                              {
                                                                  className: u.sourceNoResults
                                                              },
                                                              i.templates.noResults({
                                                                  components: f,
                                                                  createElement: o,
                                                                  Fragment: a,
                                                                  source: i,
                                                                  state: s
                                                              })
                                                          )
                                                        : o(
                                                              'ul',
                                                              Mt(
                                                                  {
                                                                      className: u.list
                                                                  },
                                                                  l.getListProps(
                                                                      Ht(
                                                                          {
                                                                              state: s,
                                                                              props: n.getListProps({})
                                                                          },
                                                                          r
                                                                      )
                                                                  )
                                                              ),
                                                              c.map(function (e) {
                                                                  var t = n.getItemProps({
                                                                      item: e,
                                                                      source: i
                                                                  });
                                                                  return o(
                                                                      'li',
                                                                      Mt(
                                                                          {
                                                                              key: t.id,
                                                                              className: u.item
                                                                          },
                                                                          l.getItemProps(
                                                                              Ht(
                                                                                  {
                                                                                      state: s,
                                                                                      props: t
                                                                                  },
                                                                                  r
                                                                              )
                                                                          )
                                                                      ),
                                                                      i.templates.item({
                                                                          components: f,
                                                                          createElement: o,
                                                                          Fragment: a,
                                                                          item: e,
                                                                          state: s
                                                                      })
                                                                  );
                                                              })
                                                          ),
                                                    i.templates.footer &&
                                                        o(
                                                            'div',
                                                            {
                                                                className: u.sourceFooter
                                                            },
                                                            i.templates.footer({
                                                                components: f,
                                                                createElement: o,
                                                                Fragment: a,
                                                                items: c,
                                                                source: i,
                                                                state: s
                                                            })
                                                        )
                                                );
                                            }),
                                        d = o(
                                            a,
                                            null,
                                            o(
                                                'div',
                                                {
                                                    className: 'aa-PanelLayout aa-Panel--scrollable'
                                                },
                                                p
                                            ),
                                            o('div', {
                                                className: 'aa-GradientBottom'
                                            })
                                        ),
                                        v = p.reduce(function (e, t) {
                                            return (e[t.props['data-autocomplete-source-id']] = t), e;
                                        }, {});
                                    e(
                                        Ht(
                                            {
                                                children: d,
                                                state: s,
                                                sections: p,
                                                elements: v,
                                                createElement: o,
                                                Fragment: a,
                                                components: f
                                            },
                                            r
                                        ),
                                        i.panel
                                    );
                                } else c.contains(i.panel) && c.removeChild(i.panel);
                            })(n, t);
                    }

                    function A() {
                        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
                        u(),
                            (f.current = zt(
                                v.value.renderer,
                                v.value.core,
                                {
                                    initialState: h.current
                                },
                                e
                            )),
                            c(),
                            o(),
                            D.value.refresh().then(function () {
                                O(h.current);
                            });
                    }

                    function E(e) {
                        requestAnimationFrame(function () {
                            var t = v.value.core.environment.document.body.contains(b.value.detachedOverlay);
                            e !== t &&
                                (e
                                    ? (v.value.core.environment.document.body.appendChild(b.value.detachedOverlay),
                                      v.value.core.environment.document.body.classList.add('aa-Detached'),
                                      b.value.input.focus())
                                    : (v.value.core.environment.document.body.removeChild(b.value.detachedOverlay),
                                      v.value.core.environment.document.body.classList.remove('aa-Detached'),
                                      D.value.setQuery(''),
                                      D.value.refresh()));
                        });
                    }
                    return (
                        r(function () {
                            var e = D.value.getEnvironmentProps({
                                formElement: b.value.form,
                                panelElement: b.value.panel,
                                inputElement: b.value.input
                            });
                            return (
                                ye(v.value.core.environment, e),
                                function () {
                                    ye(
                                        v.value.core.environment,
                                        Object.keys(e).reduce(function (e, t) {
                                            return Gt(Gt({}, e), {}, Xt({}, t, void 0));
                                        }, {})
                                    );
                                }
                            );
                        }),
                        r(function () {
                            var e = m.value ? v.value.core.environment.document.body : v.value.renderer.panelContainer,
                                t = m.value ? b.value.detachedOverlay : b.value.panel;
                            return (
                                m.value && h.current.isOpen && E(!0),
                                O(h.current),
                                function () {
                                    e.contains(t) && e.removeChild(t);
                                }
                            );
                        }),
                        r(function () {
                            var e = v.value.renderer.container;
                            return (
                                e.appendChild(b.value.root),
                                function () {
                                    e.removeChild(b.value.root);
                                }
                            );
                        }),
                        r(function () {
                            var e = se(function (e) {
                                O(e.state);
                            }, 0);
                            return (
                                (d.current = function (t) {
                                    var n = t.state,
                                        r = t.prevState;
                                    m.value && r.isOpen !== n.isOpen && E(n.isOpen),
                                        m.value || !n.isOpen || r.isOpen || _(),
                                        n.query !== r.query &&
                                            v.value.core.environment.document.querySelectorAll('.aa-Panel--scrollable').forEach(function (e) {
                                                0 !== e.scrollTop && (e.scrollTop = 0);
                                            }),
                                        e({
                                            state: n
                                        });
                                }),
                                function () {
                                    d.current = void 0;
                                }
                            );
                        }),
                        r(function () {
                            var e = se(function () {
                                var e = m.value;
                                (m.value = v.value.core.environment.matchMedia(v.value.renderer.detachedMediaQuery).matches),
                                    e !== m.value ? A({}) : requestAnimationFrame(_);
                            }, 20);
                            return (
                                v.value.core.environment.addEventListener('resize', e),
                                function () {
                                    v.value.core.environment.removeEventListener('resize', e);
                                }
                            );
                        }),
                        r(function () {
                            if (!m.value) return function () {};

                            function e(e) {
                                b.value.detachedContainer.classList.toggle('aa-DetachedContainer--modal', e);
                            }

                            function t(t) {
                                e(t.matches);
                            }
                            var n = v.value.core.environment.matchMedia(
                                getComputedStyle(v.value.core.environment.document.documentElement).getPropertyValue('--aa-detached-modal-media-query')
                            );
                            e(n.matches);
                            var r = Boolean(n.addEventListener);
                            return (
                                r ? n.addEventListener('change', t) : n.addListener(t),
                                function () {
                                    r ? n.removeEventListener('change', t) : n.removeListener(t);
                                }
                            );
                        }),
                        r(function () {
                            return requestAnimationFrame(_), function () {};
                        }),
                        Gt(
                            Gt({}, g),
                            {},
                            {
                                update: A,
                                destroy: function () {
                                    u();
                                }
                            }
                        )
                    );
                }
            },
            function (e, t, n) {
                'use strict';

                function r(e, t) {
                    var n = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var r = Object.getOwnPropertySymbols(e);
                        t &&
                            (r = r.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            n.push.apply(n, r);
                    }
                    return n;
                }

                function u(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = null != arguments[t] ? arguments[t] : {};
                        t % 2
                            ? r(Object(n), !0).forEach(function (t) {
                                  o(e, t, n[t]);
                              })
                            : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                            : r(Object(n)).forEach(function (t) {
                                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                              });
                    }
                    return e;
                }

                function o(e, t, n) {
                    return (
                        t in e
                            ? Object.defineProperty(e, t, {
                                  value: n,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0
                              })
                            : (e[t] = n),
                        e
                    );
                }
                n.d(t, 'a', function () {
                    return _;
                }),
                    n.d(t, 'b', function () {
                        return O;
                    });
                var i = n(2),
                    a = '1.2.1';

                function c(e, t) {
                    var n = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var r = Object.getOwnPropertySymbols(e);
                        t &&
                            (r = r.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            n.push.apply(n, r);
                    }
                    return n;
                }

                function l(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = null != arguments[t] ? arguments[t] : {};
                        t % 2
                            ? c(Object(n), !0).forEach(function (t) {
                                  s(e, t, n[t]);
                              })
                            : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                            : c(Object(n)).forEach(function (t) {
                                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                              });
                    }
                    return e;
                }

                function s(e, t, n) {
                    return (
                        t in e
                            ? Object.defineProperty(e, t, {
                                  value: n,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0
                              })
                            : (e[t] = n),
                        e
                    );
                }

                function f(e, t) {
                    if (null == e) return {};
                    var n,
                        r,
                        u = (function (e, t) {
                            if (null == e) return {};
                            var n,
                                r,
                                u = {},
                                o = Object.keys(e);
                            for (r = 0; r < o.length; r++) (n = o[r]), t.indexOf(n) >= 0 || (u[n] = e[n]);
                            return u;
                        })(e, t);
                    if (Object.getOwnPropertySymbols) {
                        var o = Object.getOwnPropertySymbols(e);
                        for (r = 0; r < o.length; r++) (n = o[r]), t.indexOf(n) >= 0 || (Object.prototype.propertyIsEnumerable.call(e, n) && (u[n] = e[n]));
                    }
                    return u;
                }

                function p(e) {
                    return (
                        (function (e) {
                            if (Array.isArray(e)) return d(e);
                        })(e) ||
                        (function (e) {
                            if ('undefined' != typeof Symbol && Symbol.iterator in Object(e)) return Array.from(e);
                        })(e) ||
                        (function (e, t) {
                            if (e) {
                                if ('string' == typeof e) return d(e, t);
                                var n = Object.prototype.toString.call(e).slice(8, -1);
                                return (
                                    'Object' === n && e.constructor && (n = e.constructor.name),
                                    'Map' === n || 'Set' === n
                                        ? Array.from(e)
                                        : 'Arguments' === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                                        ? d(e, t)
                                        : void 0
                                );
                            }
                        })(e) ||
                        (function () {
                            throw new TypeError(
                                'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                            );
                        })()
                    );
                }

                function d(e, t) {
                    (null == t || t > e.length) && (t = e.length);
                    for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
                    return r;
                }

                function v(e, t) {
                    var n = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var r = Object.getOwnPropertySymbols(e);
                        t &&
                            (r = r.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            n.push.apply(n, r);
                    }
                    return n;
                }

                function m(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = null != arguments[t] ? arguments[t] : {};
                        t % 2
                            ? v(Object(n), !0).forEach(function (t) {
                                  D(e, t, n[t]);
                              })
                            : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                            : v(Object(n)).forEach(function (t) {
                                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                              });
                    }
                    return e;
                }

                function D(e, t, n) {
                    return (
                        t in e
                            ? Object.defineProperty(e, t, {
                                  value: n,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0
                              })
                            : (e[t] = n),
                        e
                    );
                }
                var h = (function (e) {
                    function t(t) {
                        return e({
                            searchClient: t.searchClient,
                            queries: t.requests.map(function (e) {
                                return e.query;
                            })
                        }).then(function (e) {
                            return e.map(function (e, n) {
                                var r = t.requests[n];
                                return {
                                    items: e,
                                    sourceId: r.sourceId,
                                    transformResponse: r.transformResponse
                                };
                            });
                        });
                    }
                    return function (e) {
                        return function (n) {
                            return u(
                                u(
                                    {
                                        execute: t
                                    },
                                    e
                                ),
                                n
                            );
                        };
                    };
                })(function (e) {
                    return (
                        (t = m(
                            m({}, e),
                            {},
                            {
                                userAgents: [
                                    {
                                        segment: 'autocomplete-js',
                                        version: '1.2.1'
                                    }
                                ]
                            }
                        )),
                        (n = t.searchClient),
                        (r = t.queries),
                        (u = t.userAgents),
                        (o = void 0 === u ? [] : u),
                        'function' == typeof n.addAlgoliaAgent &&
                            [
                                {
                                    segment: 'autocomplete-core',
                                    version: a
                                }
                            ]
                                .concat(p(o))
                                .forEach(function (e) {
                                    var t = e.segment,
                                        r = e.version;
                                    n.addAlgoliaAgent(t, r);
                                }),
                        n
                            .search(
                                r.map(function (e) {
                                    var t = e.params;
                                    return l(
                                        l({}, f(e, ['params'])),
                                        {},
                                        {
                                            params: l(
                                                {
                                                    hitsPerPage: 5,
                                                    highlightPreTag: i.b,
                                                    highlightPostTag: i.a
                                                },
                                                t
                                            )
                                        }
                                    );
                                })
                            )
                            .then(function (e) {
                                return e.results;
                            })
                    );
                    var t, n, r, u, o;
                });

                function y(e, t) {
                    var n = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var r = Object.getOwnPropertySymbols(e);
                        t &&
                            (r = r.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            n.push.apply(n, r);
                    }
                    return n;
                }

                function g(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = null != arguments[t] ? arguments[t] : {};
                        t % 2
                            ? y(Object(n), !0).forEach(function (t) {
                                  b(e, t, n[t]);
                              })
                            : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                            : y(Object(n)).forEach(function (t) {
                                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                              });
                    }
                    return e;
                }

                function b(e, t, n) {
                    return (
                        t in e
                            ? Object.defineProperty(e, t, {
                                  value: n,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0
                              })
                            : (e[t] = n),
                        e
                    );
                }

                function _(e) {
                    var t = h({
                            transformResponse: function (e) {
                                return e.facetHits;
                            }
                        }),
                        n = e.queries.map(function (e) {
                            return g(
                                g({}, e),
                                {},
                                {
                                    type: 'facet'
                                }
                            );
                        });
                    return t(
                        g(
                            g({}, e),
                            {},
                            {
                                queries: n
                            }
                        )
                    );
                }
                var O = h({
                    transformResponse: function (e) {
                        return e.hits;
                    }
                });
            },
            function (e, t, n) {
                n(23), (e.exports = n(24));
            },
            function (e, t, n) {
                'use strict';
                n.r(t);
            },
            function (e, t, n) {
                'use strict';
                Object.defineProperty(t, '__esModule', {
                    value: !0
                });
                var r = n(25);
                e.exports = r.algoliasearchNetlify;
            },
            function (e, t, n) {
                'use strict';

                function r(e, t) {
                    var n = ('undefined' != typeof Symbol && e[Symbol.iterator]) || e['@@iterator'];
                    if (!n) {
                        if (
                            Array.isArray(e) ||
                            (n = (function (e, t) {
                                if (e) {
                                    if ('string' == typeof e) return u(e, t);
                                    var n = Object.prototype.toString.call(e).slice(8, -1);
                                    return (
                                        'Object' === n && e.constructor && (n = e.constructor.name),
                                        'Map' === n || 'Set' === n
                                            ? Array.from(e)
                                            : 'Arguments' === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                                            ? u(e, t)
                                            : void 0
                                    );
                                }
                            })(e)) ||
                            (t && e && 'number' == typeof e.length)
                        ) {
                            n && (e = n);
                            var r = 0,
                                o = function () {};
                            return {
                                s: o,
                                n: function () {
                                    return r >= e.length
                                        ? {
                                              done: !0
                                          }
                                        : {
                                              done: !1,
                                              value: e[r++]
                                          };
                                },
                                e: function (e) {
                                    throw e;
                                },
                                f: o
                            };
                        }
                        throw new TypeError(
                            'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                        );
                    }
                    var i,
                        a = !0,
                        c = !1;
                    return {
                        s: function () {
                            n = n.call(e);
                        },
                        n: function () {
                            var e = n.next();
                            return (a = e.done), e;
                        },
                        e: function (e) {
                            (c = !0), (i = e);
                        },
                        f: function () {
                            try {
                                a || null == n.return || n.return();
                            } finally {
                                if (c) throw i;
                            }
                        }
                    };
                }

                function u(e, t) {
                    (null == t || t > e.length) && (t = e.length);
                    for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
                    return r;
                }
                Object.defineProperty(t, '__esModule', {
                    value: !0
                }),
                    (t.algoliasearchNetlify = void 0);
                var o = n(26),
                    i = {
                        analytics: !0,
                        hitsPerPage: 5,
                        debug: !1,
                        poweredBy: !0,
                        placeholder: 'Search...',
                        openOnFocus: !1
                    },
                    a = ['appId', 'apiKey', 'selector', 'siteId', 'branch'],
                    c = [];
                t.algoliasearchNetlify = function (e) {
                    var t,
                        n = Object.assign(Object.assign({}, i), e),
                        u = r(a);
                    try {
                        for (u.s(); !(t = u.n()).done; ) {
                            var l = t.value;
                            if (!n[l]) throw new Error('[algoliasearch-netlify] Missing mandatory key: '.concat(l));
                        }
                    } catch (e) {
                        u.e(e);
                    } finally {
                        u.f();
                    }
                    var s = new o.AutocompleteWrapper(n);
                    c.push(s);
                    var f = function () {
                        s.render();
                    };
                    ['complete', 'interactive'].includes(document.readyState) ? f() : document.addEventListener('DOMContentLoaded', f);
                };
            },
            function (e, t, n) {
                'use strict';

                function r(e, t) {
                    for (var n = 0; n < t.length; n++) {
                        var r = t[n];
                        (r.enumerable = r.enumerable || !1), (r.configurable = !0), 'value' in r && (r.writable = !0), Object.defineProperty(e, r.key, r);
                    }
                }
                var u =
                    (this && this.__importDefault) ||
                    function (e) {
                        return e && e.__esModule
                            ? e
                            : {
                                  default: e
                              };
                    };
                Object.defineProperty(t, '__esModule', {
                    value: !0
                }),
                    (t.AutocompleteWrapper = void 0);
                var o = n(27),
                    i = u(n(28)),
                    a = n(29),
                    c = n(30),
                    l = (function () {
                        function e(t) {
                            !(function (e, t) {
                                if (!(e instanceof t)) throw new TypeError('Cannot call a class as a function');
                            })(this, e),
                                (this.$themeNode = null),
                                (this.options = t),
                                (this.client = this.createClient()),
                                (this.indexName = this.computeIndexName());
                        }
                        var t, n, u;
                        return (
                            (t = e),
                            (n = [
                                {
                                    key: 'render',
                                    value: function () {
                                        var e = this,
                                            t = document.querySelector(this.options.selector);
                                        if (t) {
                                            var n = void 0;
                                            void 0 !== this.options.detached &&
                                                (n =
                                                    !0 === this.options.detached
                                                        ? ''
                                                        : !1 === this.options.detached
                                                        ? 'none'
                                                        : this.options.detached.mediaQuery);
                                            var r = o.autocomplete({
                                                container: t,
                                                autoFocus: !1,
                                                placeholder: this.options.placeholder,
                                                debug: this.options.debug,
                                                openOnFocus: this.options.openOnFocus,
                                                panelPlacement: 'input-wrapper-width',
                                                detachedMediaQuery: n,
                                                getSources: function () {
                                                    return [e.getSources()];
                                                }
                                            });
                                            this.applyTheme(t.firstElementChild), (this.autocomplete = r);
                                        } else console.error('[algoliasearch-netlify] no element '.concat(this.options.selector, ' found'));
                                    }
                                },
                                {
                                    key: 'computeIndexName',
                                    value: function () {
                                        var e = this.options,
                                            t = e.siteId,
                                            n = e.branch
                                                .trim()
                                                .replace(
                                                    /(?:(?![\x2D\.0-9A-Z_a-z\xAA\xB2\xB3\xB5\xB9\xBA\xBC-\xBE\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u0660-\u0669\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07C0-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08C7\u0904-\u0939\u093D\u0950\u0958-\u0961\u0966-\u096F\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09E6-\u09F1\u09F4-\u09F9\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A66-\u0A6F\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AE6-\u0AEF\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B66-\u0B6F\u0B71-\u0B77\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0BE6-\u0BF2\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C66-\u0C6F\u0C78-\u0C7E\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CE6-\u0CEF\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D58-\u0D61\u0D66-\u0D78\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DE6-\u0DEF\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F20-\u0F33\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F-\u1049\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u1090-\u1099\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1369-\u137C\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A16\u1A20-\u1A54\u1A80-\u1A89\u1A90-\u1A99\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B50-\u1B59\u1B83-\u1BA0\u1BAE-\u1BE5\u1C00-\u1C23\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2070\u2071\u2074-\u2079\u207F-\u2089\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2150-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2CFD\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u3192-\u3195\u31A0-\u31BF\u31F0-\u31FF\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\u3400-\u4DBF\u4E00-\u9FFC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7CA\uA7F5-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA830-\uA835\uA840-\uA873\uA882-\uA8B3\uA8D0-\uA8D9\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA900-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF-\uA9D9\uA9E0-\uA9E4\uA9E6-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDE80-\uDE9C\uDEA0-\uDED0\uDEE1-\uDEFB\uDF00-\uDF23\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC58-\uDC76\uDC79-\uDC9E\uDCA7-\uDCAF\uDCE0-\uDCF2\uDCF4\uDCF5\uDCFB-\uDD1B\uDD20-\uDD39\uDD80-\uDDB7\uDDBC-\uDDCF\uDDD2-\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE40-\uDE48\uDE60-\uDE7E\uDE80-\uDE9F\uDEC0-\uDEC7\uDEC9-\uDEE4\uDEEB-\uDEEF\uDF00-\uDF35\uDF40-\uDF55\uDF58-\uDF72\uDF78-\uDF91\uDFA9-\uDFAF]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDCFA-\uDD23\uDD30-\uDD39\uDE60-\uDE7E\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF27\uDF30-\uDF45\uDF51-\uDF54\uDFB0-\uDFCB\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC52-\uDC6F\uDC83-\uDCAF\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD03-\uDD26\uDD36-\uDD3F\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDD0-\uDDDA\uDDDC\uDDE1-\uDDF4\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDEF0-\uDEF9\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC50-\uDC59\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE50-\uDE59\uDE80-\uDEAA\uDEB8\uDEC0-\uDEC9\uDF00-\uDF1A\uDF30-\uDF3B]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCF2\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDD50-\uDD59\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC50-\uDC6C\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD50-\uDD59\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDA0-\uDDA9\uDEE0-\uDEF2\uDFB0\uDFC0-\uDFD4]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF50-\uDF59\uDF5B-\uDF61\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE96\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD834[\uDEE0-\uDEF3\uDF60-\uDF78]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD40-\uDD49\uDD4E\uDEC0-\uDEEB\uDEF0-\uDEF9]|\uD83A[\uDC00-\uDCC4\uDCC7-\uDCCF\uDD00-\uDD43\uDD4B\uDD50-\uDD59]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83C[\uDD00-\uDD0C]|\uD83E[\uDFF0-\uDFF9]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A])[\s\S])+/g,
                                                    '-'
                                                )
                                                .replace(/-{2,}/g, '-')
                                                .toLocaleLowerCase();
                                        return 'netlify_'.concat(t, '_').concat(n, '_all');
                                    }
                                },
                                {
                                    key: 'createClient',
                                    value: function () {
                                        var e = i.default(this.options.appId, this.options.apiKey);
                                        return e.addAlgoliaAgent('Netlify integration '.concat(a.version)), e;
                                    }
                                },
                                {
                                    key: 'getSources',
                                    value: function () {
                                        var e = this,
                                            t = this.options.poweredBy;
                                        return {
                                            sourceId: 'algoliaHits',
                                            getItems: function (t) {
                                                var n = t.query;
                                                return o.getAlgoliaResults({
                                                    searchClient: e.client,
                                                    queries: [
                                                        {
                                                            indexName: e.indexName,
                                                            query: n,
                                                            params: {
                                                                analytics: e.options.analytics,
                                                                hitsPerPage: e.options.hitsPerPage
                                                            }
                                                        }
                                                    ]
                                                });
                                            },
                                            getItemUrl: function (e) {
                                                return e.item.url;
                                            },
                                            templates: {
                                                header: function () {
                                                    return '';
                                                },
                                                item: function (e) {
                                                    var t = e.item,
                                                        n = e.components;
                                                    return c.templates.item(t, n);
                                                },
                                                footer: function () {
                                                    return t
                                                        ? c.templates.poweredBy({
                                                              hostname: window.location.host
                                                          })
                                                        : '';
                                                }
                                            }
                                        };
                                    }
                                },
                                {
                                    key: 'applyTheme',
                                    value: function (e) {
                                        if (e && this.options.theme) {
                                            var t = this.options.theme;
                                            this.$themeNode = (function (e) {
                                                var t,
                                                    n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null,
                                                    r =
                                                        null !==
                                                            (t =
                                                                null != n ? n : document.querySelector('link[rel=stylesheet][href*="algoliasearchNetlify"]')) &&
                                                        void 0 !== t
                                                            ? t
                                                            : document.getElementsByTagName('head')[0].lastChild,
                                                    u = document.createElement('style');
                                                return (
                                                    u.setAttribute('type', 'text/css'),
                                                    u.appendChild(document.createTextNode(e)),
                                                    r.parentNode.insertBefore(u, r.nextSibling)
                                                );
                                            })(
                                                '.aa-Autocomplete, .aa-Panel, .aa-DetachedContainer {\n      '
                                                    .concat(t.mark && '--color-mark: '.concat(t.mark, ';'), '\n      ')
                                                    .concat(t.mark && '--color-background: '.concat(t.background, ';'), '\n      ')
                                                    .concat(t.mark && '--color-selected: '.concat(t.selected, ';'), '\n      ')
                                                    .concat(t.mark && '--color-text: '.concat(t.text, ';'), '\n      ')
                                                    .concat(t.mark && '--color-source-icon: '.concat(t.colorSourceIcon, ';'), '\n    }'),
                                                this.$themeNode
                                            );
                                        }
                                    }
                                }
                            ]) && r(t.prototype, n),
                            u && r(t, u),
                            e
                        );
                    })();
                t.AutocompleteWrapper = l;
            },
            function (e, t, n) {
                'use strict';
                n.r(t);
                var r = n(20);
                n.d(t, 'autocomplete', function () {
                    return r.a;
                });
                var u = n(21);
                n.d(t, 'getAlgoliaFacets', function () {
                    return u.a;
                }),
                    n.d(t, 'getAlgoliaResults', function () {
                        return u.b;
                    });
                var o = n(5);
                for (var i in o)
                    ['default', 'autocomplete', 'getAlgoliaFacets', 'getAlgoliaResults'].indexOf(i) < 0 &&
                        (function (e) {
                            n.d(t, e, function () {
                                return o[e];
                            });
                        })(i);
            },
            function (e, t, n) {
                /*! algoliasearch-lite.umd.js | 4.10.3 | © Algolia, inc. | https://github.com/algolia/algoliasearch-client-javascript */
                e.exports = (function () {
                    'use strict';

                    function e(e, t, n) {
                        return (
                            t in e
                                ? Object.defineProperty(e, t, {
                                      value: n,
                                      enumerable: !0,
                                      configurable: !0,
                                      writable: !0
                                  })
                                : (e[t] = n),
                            e
                        );
                    }

                    function t(e, t) {
                        var n = Object.keys(e);
                        if (Object.getOwnPropertySymbols) {
                            var r = Object.getOwnPropertySymbols(e);
                            t &&
                                (r = r.filter(function (t) {
                                    return Object.getOwnPropertyDescriptor(e, t).enumerable;
                                })),
                                n.push.apply(n, r);
                        }
                        return n;
                    }

                    function n(n) {
                        for (var r = 1; r < arguments.length; r++) {
                            var u = null != arguments[r] ? arguments[r] : {};
                            r % 2
                                ? t(Object(u), !0).forEach(function (t) {
                                      e(n, t, u[t]);
                                  })
                                : Object.getOwnPropertyDescriptors
                                ? Object.defineProperties(n, Object.getOwnPropertyDescriptors(u))
                                : t(Object(u)).forEach(function (e) {
                                      Object.defineProperty(n, e, Object.getOwnPropertyDescriptor(u, e));
                                  });
                        }
                        return n;
                    }

                    function r(e, t) {
                        if (null == e) return {};
                        var n,
                            r,
                            u = (function (e, t) {
                                if (null == e) return {};
                                var n,
                                    r,
                                    u = {},
                                    o = Object.keys(e);
                                for (r = 0; r < o.length; r++) (n = o[r]), t.indexOf(n) >= 0 || (u[n] = e[n]);
                                return u;
                            })(e, t);
                        if (Object.getOwnPropertySymbols) {
                            var o = Object.getOwnPropertySymbols(e);
                            for (r = 0; r < o.length; r++) (n = o[r]), t.indexOf(n) >= 0 || (Object.prototype.propertyIsEnumerable.call(e, n) && (u[n] = e[n]));
                        }
                        return u;
                    }

                    function u(e, t) {
                        return (
                            (function (e) {
                                if (Array.isArray(e)) return e;
                            })(e) ||
                            (function (e, t) {
                                if (Symbol.iterator in Object(e) || '[object Arguments]' === Object.prototype.toString.call(e)) {
                                    var n = [],
                                        r = !0,
                                        u = !1,
                                        o = void 0;
                                    try {
                                        for (var i, a = e[Symbol.iterator](); !(r = (i = a.next()).done) && (n.push(i.value), !t || n.length !== t); r = !0);
                                    } catch (e) {
                                        (u = !0), (o = e);
                                    } finally {
                                        try {
                                            r || null == a.return || a.return();
                                        } finally {
                                            if (u) throw o;
                                        }
                                    }
                                    return n;
                                }
                            })(e, t) ||
                            (function () {
                                throw new TypeError('Invalid attempt to destructure non-iterable instance');
                            })()
                        );
                    }

                    function o(e) {
                        return (
                            (function (e) {
                                if (Array.isArray(e)) {
                                    for (var t = 0, n = new Array(e.length); t < e.length; t++) n[t] = e[t];
                                    return n;
                                }
                            })(e) ||
                            (function (e) {
                                if (Symbol.iterator in Object(e) || '[object Arguments]' === Object.prototype.toString.call(e)) return Array.from(e);
                            })(e) ||
                            (function () {
                                throw new TypeError('Invalid attempt to spread non-iterable instance');
                            })()
                        );
                    }

                    function i(e) {
                        var t,
                            n = 'algoliasearch-client-js-'.concat(e.key),
                            r = function () {
                                return void 0 === t && (t = e.localStorage || window.localStorage), t;
                            },
                            o = function () {
                                return JSON.parse(r().getItem(n) || '{}');
                            };
                        return {
                            get: function (e, t) {
                                var n =
                                    arguments.length > 2 && void 0 !== arguments[2]
                                        ? arguments[2]
                                        : {
                                              miss: function () {
                                                  return Promise.resolve();
                                              }
                                          };
                                return Promise.resolve()
                                    .then(function () {
                                        var n = JSON.stringify(e),
                                            r = o()[n];
                                        return Promise.all([r || t(), void 0 !== r]);
                                    })
                                    .then(function (e) {
                                        var t = u(e, 2),
                                            r = t[0],
                                            o = t[1];
                                        return Promise.all([r, o || n.miss(r)]);
                                    })
                                    .then(function (e) {
                                        return u(e, 1)[0];
                                    });
                            },
                            set: function (e, t) {
                                return Promise.resolve().then(function () {
                                    var u = o();
                                    return (u[JSON.stringify(e)] = t), r().setItem(n, JSON.stringify(u)), t;
                                });
                            },
                            delete: function (e) {
                                return Promise.resolve().then(function () {
                                    var t = o();
                                    delete t[JSON.stringify(e)], r().setItem(n, JSON.stringify(t));
                                });
                            },
                            clear: function () {
                                return Promise.resolve().then(function () {
                                    r().removeItem(n);
                                });
                            }
                        };
                    }

                    function a(e) {
                        var t = o(e.caches),
                            n = t.shift();
                        return void 0 === n
                            ? {
                                  get: function (e, t) {
                                      var n =
                                          arguments.length > 2 && void 0 !== arguments[2]
                                              ? arguments[2]
                                              : {
                                                    miss: function () {
                                                        return Promise.resolve();
                                                    }
                                                };
                                      return t()
                                          .then(function (e) {
                                              return Promise.all([e, n.miss(e)]);
                                          })
                                          .then(function (e) {
                                              return u(e, 1)[0];
                                          });
                                  },
                                  set: function (e, t) {
                                      return Promise.resolve(t);
                                  },
                                  delete: function (e) {
                                      return Promise.resolve();
                                  },
                                  clear: function () {
                                      return Promise.resolve();
                                  }
                              }
                            : {
                                  get: function (e, r) {
                                      var u =
                                          arguments.length > 2 && void 0 !== arguments[2]
                                              ? arguments[2]
                                              : {
                                                    miss: function () {
                                                        return Promise.resolve();
                                                    }
                                                };
                                      return n.get(e, r, u).catch(function () {
                                          return a({
                                              caches: t
                                          }).get(e, r, u);
                                      });
                                  },
                                  set: function (e, r) {
                                      return n.set(e, r).catch(function () {
                                          return a({
                                              caches: t
                                          }).set(e, r);
                                      });
                                  },
                                  delete: function (e) {
                                      return n.delete(e).catch(function () {
                                          return a({
                                              caches: t
                                          }).delete(e);
                                      });
                                  },
                                  clear: function () {
                                      return n.clear().catch(function () {
                                          return a({
                                              caches: t
                                          }).clear();
                                      });
                                  }
                              };
                    }

                    function c() {
                        var e =
                                arguments.length > 0 && void 0 !== arguments[0]
                                    ? arguments[0]
                                    : {
                                          serializable: !0
                                      },
                            t = {};
                        return {
                            get: function (n, r) {
                                var u =
                                        arguments.length > 2 && void 0 !== arguments[2]
                                            ? arguments[2]
                                            : {
                                                  miss: function () {
                                                      return Promise.resolve();
                                                  }
                                              },
                                    o = JSON.stringify(n);
                                if (o in t) return Promise.resolve(e.serializable ? JSON.parse(t[o]) : t[o]);
                                var i = r(),
                                    a =
                                        (u && u.miss) ||
                                        function () {
                                            return Promise.resolve();
                                        };
                                return i
                                    .then(function (e) {
                                        return a(e);
                                    })
                                    .then(function () {
                                        return i;
                                    });
                            },
                            set: function (n, r) {
                                return (t[JSON.stringify(n)] = e.serializable ? JSON.stringify(r) : r), Promise.resolve(r);
                            },
                            delete: function (e) {
                                return delete t[JSON.stringify(e)], Promise.resolve();
                            },
                            clear: function () {
                                return (t = {}), Promise.resolve();
                            }
                        };
                    }

                    function l(e) {
                        for (var t = e.length - 1; t > 0; t--) {
                            var n = Math.floor(Math.random() * (t + 1)),
                                r = e[t];
                            (e[t] = e[n]), (e[n] = r);
                        }
                        return e;
                    }

                    function s(e, t) {
                        return t
                            ? (Object.keys(t).forEach(function (n) {
                                  e[n] = t[n](e);
                              }),
                              e)
                            : e;
                    }

                    function f(e) {
                        for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++) n[r - 1] = arguments[r];
                        var u = 0;
                        return e.replace(/%s/g, function () {
                            return encodeURIComponent(n[u++]);
                        });
                    }
                    var p = {
                        WithinQueryParameters: 0,
                        WithinHeaders: 1
                    };

                    function d(e, t) {
                        var n = e || {},
                            r = n.data || {};
                        return (
                            Object.keys(n).forEach(function (e) {
                                -1 === ['timeout', 'headers', 'queryParameters', 'data', 'cacheable'].indexOf(e) && (r[e] = n[e]);
                            }),
                            {
                                data: Object.entries(r).length > 0 ? r : void 0,
                                timeout: n.timeout || t,
                                headers: n.headers || {},
                                queryParameters: n.queryParameters || {},
                                cacheable: n.cacheable
                            }
                        );
                    }
                    var v = {
                            Read: 1,
                            Write: 2,
                            Any: 3
                        },
                        m = 1,
                        D = 2,
                        h = 3;

                    function y(e) {
                        var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : m;
                        return n(
                            n({}, e),
                            {},
                            {
                                status: t,
                                lastUpdate: Date.now()
                            }
                        );
                    }

                    function g(e) {
                        return 'string' == typeof e
                            ? {
                                  protocol: 'https',
                                  url: e,
                                  accept: v.Any
                              }
                            : {
                                  protocol: e.protocol || 'https',
                                  url: e.url,
                                  accept: e.accept || v.Any
                              };
                    }
                    var b = 'GET',
                        _ = 'POST';

                    function O(e, t) {
                        return Promise.all(
                            t.map(function (t) {
                                return e.get(t, function () {
                                    return Promise.resolve(y(t));
                                });
                            })
                        ).then(function (e) {
                            var n = e.filter(function (e) {
                                    return (function (e) {
                                        return e.status === m || Date.now() - e.lastUpdate > 12e4;
                                    })(e);
                                }),
                                r = e.filter(function (e) {
                                    return (function (e) {
                                        return e.status === h && Date.now() - e.lastUpdate <= 12e4;
                                    })(e);
                                }),
                                u = [].concat(o(n), o(r));
                            return {
                                getTimeout: function (e, t) {
                                    return (0 === r.length && 0 === e ? 1 : r.length + 3 + e) * t;
                                },
                                statelessHosts:
                                    u.length > 0
                                        ? u.map(function (e) {
                                              return g(e);
                                          })
                                        : t
                            };
                        });
                    }

                    function A(e, t, r, u) {
                        var i = [],
                            a = (function (e, t) {
                                if (e.method !== b && (void 0 !== e.data || void 0 !== t.data)) {
                                    var r = Array.isArray(e.data) ? e.data : n(n({}, e.data), t.data);
                                    return JSON.stringify(r);
                                }
                            })(r, u),
                            c = (function (e, t) {
                                var r = n(n({}, e.headers), t.headers),
                                    u = {};
                                return (
                                    Object.keys(r).forEach(function (e) {
                                        var t = r[e];
                                        u[e.toLowerCase()] = t;
                                    }),
                                    u
                                );
                            })(e, u),
                            l = r.method,
                            s = r.method !== b ? {} : n(n({}, r.data), u.data),
                            f = n(
                                n(
                                    n(
                                        {
                                            'x-algolia-agent': e.userAgent.value
                                        },
                                        e.queryParameters
                                    ),
                                    s
                                ),
                                u.queryParameters
                            ),
                            p = 0,
                            d = function t(n, o) {
                                var s = n.pop();
                                if (void 0 === s)
                                    throw {
                                        name: 'RetryError',
                                        message:
                                            'Unreachable hosts - your application id may be incorrect. If the error persists, contact support@algolia.com.',
                                        transporterStackTrace: P(i)
                                    };
                                var d = {
                                        data: a,
                                        headers: c,
                                        method: l,
                                        url: C(s, r.path, f),
                                        connectTimeout: o(p, e.timeouts.connect),
                                        responseTimeout: o(p, u.timeout)
                                    },
                                    v = function (e) {
                                        var t = {
                                            request: d,
                                            response: e,
                                            host: s,
                                            triesLeft: n.length
                                        };
                                        return i.push(t), t;
                                    },
                                    m = {
                                        onSuccess: function (e) {
                                            return (function (e) {
                                                try {
                                                    return JSON.parse(e.content);
                                                } catch (t) {
                                                    throw (function (e, t) {
                                                        return {
                                                            name: 'DeserializationError',
                                                            message: e,
                                                            response: t
                                                        };
                                                    })(t.message, e);
                                                }
                                            })(e);
                                        },
                                        onRetry: function (r) {
                                            var u = v(r);
                                            return (
                                                r.isTimedOut && p++,
                                                Promise.all([e.logger.info('Retryable failure', j(u)), e.hostsCache.set(s, y(s, r.isTimedOut ? h : D))]).then(
                                                    function () {
                                                        return t(n, o);
                                                    }
                                                )
                                            );
                                        },
                                        onFail: function (e) {
                                            throw (
                                                (v(e),
                                                (function (e, t) {
                                                    var n = e.content,
                                                        r = e.status,
                                                        u = n;
                                                    try {
                                                        u = JSON.parse(n).message;
                                                    } catch (e) {}
                                                    return (function (e, t, n) {
                                                        return {
                                                            name: 'ApiError',
                                                            message: e,
                                                            status: t,
                                                            transporterStackTrace: n
                                                        };
                                                    })(u, r, t);
                                                })(e, P(i)))
                                            );
                                        }
                                    };
                                return e.requester.send(d).then(function (e) {
                                    return (function (e, t) {
                                        return (function (e) {
                                            var t = e.status;
                                            return (
                                                e.isTimedOut ||
                                                (function (e) {
                                                    var t = e.isTimedOut,
                                                        n = e.status;
                                                    return !t && 0 == ~~n;
                                                })(e) ||
                                                (2 != ~~(t / 100) && 4 != ~~(t / 100))
                                            );
                                        })(e)
                                            ? t.onRetry(e)
                                            : 2 == ~~(e.status / 100)
                                            ? t.onSuccess(e)
                                            : t.onFail(e);
                                    })(e, m);
                                });
                            };
                        return O(e.hostsCache, t).then(function (e) {
                            return d(o(e.statelessHosts).reverse(), e.getTimeout);
                        });
                    }

                    function E(e) {
                        var t = {
                            value: 'Algolia for JavaScript ('.concat(e, ')'),
                            add: function (e) {
                                var n = '; '.concat(e.segment).concat(void 0 !== e.version ? ' ('.concat(e.version, ')') : '');
                                return -1 === t.value.indexOf(n) && (t.value = ''.concat(t.value).concat(n)), t;
                            }
                        };
                        return t;
                    }

                    function C(e, t, n) {
                        var r = F(n),
                            u = ''
                                .concat(e.protocol, '://')
                                .concat(e.url, '/')
                                .concat('/' === t.charAt(0) ? t.substr(1) : t);
                        return r.length && (u += '?'.concat(r)), u;
                    }

                    function F(e) {
                        return Object.keys(e)
                            .map(function (t) {
                                return f(
                                    '%s=%s',
                                    t,
                                    ((n = e[t]),
                                    '[object Object]' === Object.prototype.toString.call(n) || '[object Array]' === Object.prototype.toString.call(n)
                                        ? JSON.stringify(e[t])
                                        : e[t])
                                );
                                var n;
                            })
                            .join('&');
                    }

                    function P(e) {
                        return e.map(function (e) {
                            return j(e);
                        });
                    }

                    function j(e) {
                        var t = e.request.headers['x-algolia-api-key']
                            ? {
                                  'x-algolia-api-key': '*****'
                              }
                            : {};
                        return n(
                            n({}, e),
                            {},
                            {
                                request: n(
                                    n({}, e.request),
                                    {},
                                    {
                                        headers: n(n({}, e.request.headers), t)
                                    }
                                )
                            }
                        );
                    }
                    var w = function (e) {
                            var t = e.appId,
                                r = (function (e, t, n) {
                                    var r = {
                                        'x-algolia-api-key': n,
                                        'x-algolia-application-id': t
                                    };
                                    return {
                                        headers: function () {
                                            return e === p.WithinHeaders ? r : {};
                                        },
                                        queryParameters: function () {
                                            return e === p.WithinQueryParameters ? r : {};
                                        }
                                    };
                                })(void 0 !== e.authMode ? e.authMode : p.WithinHeaders, t, e.apiKey),
                                o = (function (e) {
                                    var t = e.hostsCache,
                                        n = e.logger,
                                        r = e.requester,
                                        o = e.requestsCache,
                                        i = e.responsesCache,
                                        a = e.timeouts,
                                        c = e.userAgent,
                                        l = e.hosts,
                                        s = e.queryParameters,
                                        f = {
                                            hostsCache: t,
                                            logger: n,
                                            requester: r,
                                            requestsCache: o,
                                            responsesCache: i,
                                            timeouts: a,
                                            userAgent: c,
                                            headers: e.headers,
                                            queryParameters: s,
                                            hosts: l.map(function (e) {
                                                return g(e);
                                            }),
                                            read: function (e, t) {
                                                var n = d(t, f.timeouts.read),
                                                    r = function () {
                                                        return A(
                                                            f,
                                                            f.hosts.filter(function (e) {
                                                                return 0 != (e.accept & v.Read);
                                                            }),
                                                            e,
                                                            n
                                                        );
                                                    };
                                                if (!0 !== (void 0 !== n.cacheable ? n.cacheable : e.cacheable)) return r();
                                                var o = {
                                                    request: e,
                                                    mappedRequestOptions: n,
                                                    transporter: {
                                                        queryParameters: f.queryParameters,
                                                        headers: f.headers
                                                    }
                                                };
                                                return f.responsesCache.get(
                                                    o,
                                                    function () {
                                                        return f.requestsCache.get(o, function () {
                                                            return f.requestsCache
                                                                .set(o, r())
                                                                .then(
                                                                    function (e) {
                                                                        return Promise.all([f.requestsCache.delete(o), e]);
                                                                    },
                                                                    function (e) {
                                                                        return Promise.all([f.requestsCache.delete(o), Promise.reject(e)]);
                                                                    }
                                                                )
                                                                .then(function (e) {
                                                                    var t = u(e, 2);
                                                                    return t[0], t[1];
                                                                });
                                                        });
                                                    },
                                                    {
                                                        miss: function (e) {
                                                            return f.responsesCache.set(o, e);
                                                        }
                                                    }
                                                );
                                            },
                                            write: function (e, t) {
                                                return A(
                                                    f,
                                                    f.hosts.filter(function (e) {
                                                        return 0 != (e.accept & v.Write);
                                                    }),
                                                    e,
                                                    d(t, f.timeouts.write)
                                                );
                                            }
                                        };
                                    return f;
                                })(
                                    n(
                                        n(
                                            {
                                                hosts: [
                                                    {
                                                        url: ''.concat(t, '-dsn.algolia.net'),
                                                        accept: v.Read
                                                    },
                                                    {
                                                        url: ''.concat(t, '.algolia.net'),
                                                        accept: v.Write
                                                    }
                                                ].concat(
                                                    l([
                                                        {
                                                            url: ''.concat(t, '-1.algolianet.com')
                                                        },
                                                        {
                                                            url: ''.concat(t, '-2.algolianet.com')
                                                        },
                                                        {
                                                            url: ''.concat(t, '-3.algolianet.com')
                                                        }
                                                    ])
                                                )
                                            },
                                            e
                                        ),
                                        {},
                                        {
                                            headers: n(
                                                n(n({}, r.headers()), {
                                                    'content-type': 'application/x-www-form-urlencoded'
                                                }),
                                                e.headers
                                            ),
                                            queryParameters: n(n({}, r.queryParameters()), e.queryParameters)
                                        }
                                    )
                                );
                            return s(
                                {
                                    transporter: o,
                                    appId: t,
                                    addAlgoliaAgent: function (e, t) {
                                        o.userAgent.add({
                                            segment: e,
                                            version: t
                                        });
                                    },
                                    clearCache: function () {
                                        return Promise.all([o.requestsCache.clear(), o.responsesCache.clear()]).then(function () {});
                                    }
                                },
                                e.methods
                            );
                        },
                        S = function (e) {
                            return function (t) {
                                var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                                return s(
                                    {
                                        transporter: e.transporter,
                                        appId: e.appId,
                                        indexName: t
                                    },
                                    n.methods
                                );
                            };
                        },
                        B = function (e) {
                            return function (t, r) {
                                var u = t.map(function (e) {
                                    return n(
                                        n({}, e),
                                        {},
                                        {
                                            params: F(e.params || {})
                                        }
                                    );
                                });
                                return e.transporter.read(
                                    {
                                        method: _,
                                        path: '1/indexes/*/queries',
                                        data: {
                                            requests: u
                                        },
                                        cacheable: !0
                                    },
                                    r
                                );
                            };
                        },
                        I = function (e) {
                            return function (t, u) {
                                return Promise.all(
                                    t.map(function (t) {
                                        var o = t.params,
                                            i = o.facetName,
                                            a = o.facetQuery,
                                            c = r(o, ['facetName', 'facetQuery']);
                                        return S(e)(t.indexName, {
                                            methods: {
                                                searchForFacetValues: N
                                            }
                                        }).searchForFacetValues(i, a, n(n({}, u), c));
                                    })
                                );
                            };
                        },
                        k = function (e) {
                            return function (t, n, r) {
                                return e.transporter.read(
                                    {
                                        method: _,
                                        path: f('1/answers/%s/prediction', e.indexName),
                                        data: {
                                            query: t,
                                            queryLanguages: n
                                        },
                                        cacheable: !0
                                    },
                                    r
                                );
                            };
                        },
                        x = function (e) {
                            return function (t, n) {
                                return e.transporter.read(
                                    {
                                        method: _,
                                        path: f('1/indexes/%s/query', e.indexName),
                                        data: {
                                            query: t
                                        },
                                        cacheable: !0
                                    },
                                    n
                                );
                            };
                        },
                        N = function (e) {
                            return function (t, n, r) {
                                return e.transporter.read(
                                    {
                                        method: _,
                                        path: f('1/indexes/%s/facets/%s/query', e.indexName, t),
                                        data: {
                                            facetQuery: n
                                        },
                                        cacheable: !0
                                    },
                                    r
                                );
                            };
                        },
                        T = 1,
                        q = 2,
                        R = 3;

                    function L(e, t, r) {
                        var u,
                            o = {
                                appId: e,
                                apiKey: t,
                                timeouts: {
                                    connect: 1,
                                    read: 2,
                                    write: 30
                                },
                                requester: {
                                    send: function (e) {
                                        return new Promise(function (t) {
                                            var n = new XMLHttpRequest();
                                            n.open(e.method, e.url, !0),
                                                Object.keys(e.headers).forEach(function (t) {
                                                    return n.setRequestHeader(t, e.headers[t]);
                                                });
                                            var r,
                                                u = function (e, r) {
                                                    return setTimeout(function () {
                                                        n.abort(),
                                                            t({
                                                                status: 0,
                                                                content: r,
                                                                isTimedOut: !0
                                                            });
                                                    }, 1e3 * e);
                                                },
                                                o = u(e.connectTimeout, 'Connection timeout');
                                            (n.onreadystatechange = function () {
                                                n.readyState > n.OPENED && void 0 === r && (clearTimeout(o), (r = u(e.responseTimeout, 'Socket timeout')));
                                            }),
                                                (n.onerror = function () {
                                                    0 === n.status &&
                                                        (clearTimeout(o),
                                                        clearTimeout(r),
                                                        t({
                                                            content: n.responseText || 'Network request failed',
                                                            status: n.status,
                                                            isTimedOut: !1
                                                        }));
                                                }),
                                                (n.onload = function () {
                                                    clearTimeout(o),
                                                        clearTimeout(r),
                                                        t({
                                                            content: n.responseText,
                                                            status: n.status,
                                                            isTimedOut: !1
                                                        });
                                                }),
                                                n.send(e.data);
                                        });
                                    }
                                },
                                logger:
                                    ((u = R),
                                    {
                                        debug: function (e, t) {
                                            return T >= u && console.debug(e, t), Promise.resolve();
                                        },
                                        info: function (e, t) {
                                            return q >= u && console.info(e, t), Promise.resolve();
                                        },
                                        error: function (e, t) {
                                            return console.error(e, t), Promise.resolve();
                                        }
                                    }),
                                responsesCache: c(),
                                requestsCache: c({
                                    serializable: !1
                                }),
                                hostsCache: a({
                                    caches: [
                                        i({
                                            key: ''.concat('4.10.3', '-').concat(e)
                                        }),
                                        c()
                                    ]
                                }),
                                userAgent: E('4.10.3').add({
                                    segment: 'Browser',
                                    version: 'lite'
                                }),
                                authMode: p.WithinQueryParameters
                            };
                        return w(
                            n(
                                n(n({}, o), r),
                                {},
                                {
                                    methods: {
                                        search: B,
                                        searchForFacetValues: I,
                                        multipleQueries: B,
                                        multipleSearchForFacetValues: I,
                                        initIndex: function (e) {
                                            return function (t) {
                                                return S(e)(t, {
                                                    methods: {
                                                        search: x,
                                                        searchForFacetValues: N,
                                                        findAnswers: k
                                                    }
                                                });
                                            };
                                        }
                                    }
                                }
                            )
                        );
                    }
                    return (L.version = '4.10.3'), L;
                })();
            },
            function (e) {
                e.exports = JSON.parse(
                    '{"name":"@algolia/algoliasearch-netlify-frontend","version":"1.0.8","private":false,"author":"Algolia Team <contact@algolia.com>","license":"MIT","repository":"https://github.com/algolia/algoliasearch-netlify.git","bugs":{"url":"https://github.com/algolia/algoliasearch-netlify/issues"},"files":["README.md","dist/"],"scripts":{"build":"npx webpack --mode production","dev":"PORT=9100 npx webpack serve --mode development","postinstall":"[ -d dist/ ] || npm run build"},"devDependencies":{"@algolia/autocomplete-js":"1.2.1","@algolia/autocomplete-preset-algolia":"1.2.1","@algolia/autocomplete-theme-classic":"1.2.1","@algolia/transporter":"4.10.3","@babel/core":"7.14.6","@babel/preset-env":"7.14.7","@types/react":"17.0.14","algoliasearch":"4.10.3","babel-loader":"8.2.2","clean-webpack-plugin":"3.0.0","core-js":"3.15.2","css-loader":"5.2.6","fork-ts-checker-webpack-plugin":"6.2.12","mini-css-extract-plugin":"1.6.2","mustache":"4.2.0","node-sass":"6.0.1","postcss":"8.3.5","postcss-loader":"4.3.0","postcss-preset-env":"6.7.0","preact":"10.5.14","sass-loader":"10.2.0","terser-webpack-plugin":"4.2.3","ts-loader":"8.3.0","webpack":"4.46.0","webpack-cli":"4.7.2","webpack-dev-server":"3.11.2"},"keywords":["algolia","algoliasearch","crawl","crawler","indexing","jamstack","netlify-plugin","netlify-search","netlify","plugin","robots","search","ui"]}'
                );
            },
            function (e, t, n) {
                'use strict';
                Object.defineProperty(t, '__esModule', {
                    value: !0
                }),
                    (t.templates = void 0);
                var r = n(31);

                function u(e, t) {
                    var n = [],
                        u = 0;
                    if (!e.hierarchy) return n;
                    for (var o = 1; o < 7 && u < 3; ++o)
                        e.hierarchy['lvl'.concat(o)] &&
                            e.hierarchy['lvl'.concat(o)].length > 0 &&
                            (u > 0 && n.push(' > '),
                            n.push(
                                r.jsx(
                                    t.Highlight,
                                    {
                                        hit: e,
                                        attribute: 'description'
                                    },
                                    void 0
                                )
                            ),
                            ++u);
                    return n;
                }

                function o(e, t) {
                    var n,
                        u,
                        o = null === (n = e._snippetResult) || void 0 === n ? void 0 : n.description,
                        i = null === (u = e._snippetResult) || void 0 === u ? void 0 : u.content;
                    return o && 'full' === o.matchLevel
                        ? r.jsx(
                              t.Snippet,
                              {
                                  hit: e,
                                  attribute: 'description'
                              },
                              void 0
                          )
                        : i && 'full' === i.matchLevel
                        ? r.jsx(
                              t.Snippet,
                              {
                                  hit: e,
                                  attribute: 'content'
                              },
                              void 0
                          )
                        : o && !i
                        ? r.jsx(
                              t.Snippet,
                              {
                                  hit: e,
                                  attribute: 'description'
                              },
                              void 0
                          )
                        : i
                        ? r.jsx(
                              t.Snippet,
                              {
                                  hit: e,
                                  attribute: 'content'
                              },
                              void 0
                          )
                        : e.description || e.content || '';
                }
                t.templates = {
                    poweredBy: function (e) {
                        var t = e.hostname,
                            n = encodeURIComponent(t);
                        return r.jsxs(
                            'div',
                            Object.assign(
                                {
                                    className: 'aa-powered-by'
                                },
                                {
                                    children: [
                                        'Search by',
                                        r.jsx(
                                            'a',
                                            Object.assign(
                                                {
                                                    href: 'https://www.algolia.com/?utm_source=netlify&utm_medium=link&utm_campaign=autocomplete-'.concat(n),
                                                    className: 'aa-powered-by-link'
                                                },
                                                {
                                                    children: 'Algolia'
                                                }
                                            ),
                                            void 0
                                        )
                                    ]
                                }
                            ),
                            void 0
                        );
                    },
                    item: function (e, t) {
                        var n, i;
                        return r.jsx(
                            'a',
                            Object.assign(
                                {
                                    href: e.url
                                },
                                {
                                    children: r.jsxs(
                                        'div',
                                        Object.assign(
                                            {
                                                className: 'aa-ItemContent'
                                            },
                                            {
                                                children: [
                                                    r.jsx(
                                                        'div',
                                                        Object.assign(
                                                            {
                                                                className: 'aa-ItemIcon'
                                                            },
                                                            {
                                                                children: r.jsx(
                                                                    'svg',
                                                                    Object.assign(
                                                                        {
                                                                            width: '20',
                                                                            height: '20',
                                                                            viewBox: '0 0 20 20'
                                                                        },
                                                                        {
                                                                            children: r.jsx(
                                                                                'path',
                                                                                {
                                                                                    d: 'M17 6v12c0 .52-.2 1-1 1H4c-.7 0-1-.33-1-1V2c0-.55.42-1 1-1h8l5 5zM14 8h-3.13c-.51 0-.87-.34-.87-.87V4',
                                                                                    stroke: 'currentColor',
                                                                                    fill: 'none',
                                                                                    fillRule: 'evenodd',
                                                                                    strokeLinejoin: 'round'
                                                                                },
                                                                                void 0
                                                                            )
                                                                        }
                                                                    ),
                                                                    void 0
                                                                )
                                                            }
                                                        ),
                                                        void 0
                                                    ),
                                                    r.jsxs(
                                                        'div',
                                                        {
                                                            children: [
                                                                r.jsx(
                                                                    'div',
                                                                    Object.assign(
                                                                        {
                                                                            className: 'aa-ItemTitle'
                                                                        },
                                                                        {
                                                                            children:
                                                                                null !== (i = null === (n = e.hierarchy) || void 0 === n ? void 0 : n.lvl0) &&
                                                                                void 0 !== i
                                                                                    ? i
                                                                                    : r.jsx(
                                                                                          t.Highlight,
                                                                                          {
                                                                                              hit: e,
                                                                                              attribute: 'title'
                                                                                          },
                                                                                          void 0
                                                                                      )
                                                                        }
                                                                    ),
                                                                    void 0
                                                                ),
                                                                e.hierarchy &&
                                                                    r.jsx(
                                                                        'div',
                                                                        Object.assign(
                                                                            {
                                                                                className: 'aa-ItemHierarchy'
                                                                            },
                                                                            {
                                                                                children: u(e, t)
                                                                            }
                                                                        ),
                                                                        void 0
                                                                    ),
                                                                r.jsx(
                                                                    'div',
                                                                    Object.assign(
                                                                        {
                                                                            className: 'aa-ItemDescription'
                                                                        },
                                                                        {
                                                                            children: o(e, t)
                                                                        }
                                                                    ),
                                                                    void 0
                                                                )
                                                            ]
                                                        },
                                                        void 0
                                                    )
                                                ]
                                            }
                                        ),
                                        void 0
                                    )
                                }
                            ),
                            void 0
                        );
                    }
                };
            },
            function (e, t, n) {
                'use strict';
                n.r(t),
                    n.d(t, 'Fragment', function () {
                        return m;
                    }),
                    n.d(t, 'jsx', function () {
                        return N;
                    }),
                    n.d(t, 'jsxs', function () {
                        return N;
                    }),
                    n.d(t, 'jsxDEV', function () {
                        return N;
                    });
                var r,
                    u,
                    o,
                    i,
                    a,
                    c,
                    l = {},
                    s = [],
                    f = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;

                function p(e, t) {
                    for (var n in t) e[n] = t[n];
                    return e;
                }

                function d(e) {
                    var t = e.parentNode;
                    t && t.removeChild(e);
                }

                function v(e, t, n, r, i) {
                    var a = {
                        type: e,
                        props: t,
                        key: n,
                        ref: r,
                        __k: null,
                        __: null,
                        __b: 0,
                        __e: null,
                        __d: void 0,
                        __c: null,
                        __h: null,
                        constructor: void 0,
                        __v: null == i ? ++o : i
                    };
                    return null != u.vnode && u.vnode(a), a;
                }

                function m(e) {
                    return e.children;
                }

                function D(e, t) {
                    (this.props = e), (this.context = t);
                }

                function h(e, t) {
                    if (null == t) return e.__ ? h(e.__, e.__.__k.indexOf(e) + 1) : null;
                    for (var n; t < e.__k.length; t++) if (null != (n = e.__k[t]) && null != n.__e) return n.__e;
                    return 'function' == typeof e.type ? h(e) : null;
                }

                function y(e) {
                    var t, n;
                    if (null != (e = e.__) && null != e.__c) {
                        for (e.__e = e.__c.base = null, t = 0; t < e.__k.length; t++)
                            if (null != (n = e.__k[t]) && null != n.__e) {
                                e.__e = e.__c.base = n.__e;
                                break;
                            }
                        return y(e);
                    }
                }

                function g(e) {
                    ((!e.__d && (e.__d = !0) && i.push(e) && !b.__r++) || c !== u.debounceRendering) && ((c = u.debounceRendering) || a)(b);
                }

                function b() {
                    for (var e; (b.__r = i.length); )
                        (e = i.sort(function (e, t) {
                            return e.__v.__b - t.__v.__b;
                        })),
                            (i = []),
                            e.some(function (e) {
                                var t, n, r, u, o, i;
                                e.__d &&
                                    ((o = (u = (t = e).__v).__e),
                                    (i = t.__P) &&
                                        ((n = []),
                                        ((r = p({}, u)).__v = u.__v + 1),
                                        j(i, u, r, t.__n, void 0 !== i.ownerSVGElement, null != u.__h ? [o] : null, n, null == o ? h(u) : o, u.__h),
                                        w(n, u),
                                        u.__e != o && y(u)));
                            });
                }

                function _(e, t, n, r, u, o, i, a, c, f) {
                    var p,
                        d,
                        D,
                        y,
                        g,
                        b,
                        _,
                        E = (r && r.__k) || s,
                        C = E.length;
                    for (n.__k = [], p = 0; p < t.length; p++)
                        if (
                            null !=
                            (y = n.__k[p] =
                                null == (y = t[p]) || 'boolean' == typeof y
                                    ? null
                                    : 'string' == typeof y || 'number' == typeof y || 'bigint' == typeof y
                                    ? v(null, y, null, null, y)
                                    : Array.isArray(y)
                                    ? v(
                                          m,
                                          {
                                              children: y
                                          },
                                          null,
                                          null,
                                          null
                                      )
                                    : y.__b > 0
                                    ? v(y.type, y.props, y.key, null, y.__v)
                                    : y)
                        ) {
                            if (((y.__ = n), (y.__b = n.__b + 1), null === (D = E[p]) || (D && y.key == D.key && y.type === D.type))) E[p] = void 0;
                            else
                                for (d = 0; d < C; d++) {
                                    if ((D = E[d]) && y.key == D.key && y.type === D.type) {
                                        E[d] = void 0;
                                        break;
                                    }
                                    D = null;
                                }
                            j(e, y, (D = D || l), u, o, i, a, c, f),
                                (g = y.__e),
                                (d = y.ref) && D.ref != d && (_ || (_ = []), D.ref && _.push(D.ref, null, y), _.push(d, y.__c || g, y)),
                                null != g
                                    ? (null == b && (b = g),
                                      'function' == typeof y.type && null != y.__k && y.__k === D.__k ? (y.__d = c = O(y, c, e)) : (c = A(e, y, D, E, g, c)),
                                      f || 'option' !== n.type ? 'function' == typeof n.type && (n.__d = c) : (e.value = ''))
                                    : c && D.__e == c && c.parentNode != e && (c = h(D));
                        }
                    for (n.__e = b, p = C; p--; )
                        null != E[p] && ('function' == typeof n.type && null != E[p].__e && E[p].__e == n.__d && (n.__d = h(r, p + 1)), I(E[p], E[p]));
                    if (_) for (p = 0; p < _.length; p++) B(_[p], _[++p], _[++p]);
                }

                function O(e, t, n) {
                    var r, u;
                    for (r = 0; r < e.__k.length; r++)
                        (u = e.__k[r]) && ((u.__ = e), (t = 'function' == typeof u.type ? O(u, t, n) : A(n, u, u, e.__k, u.__e, t)));
                    return t;
                }

                function A(e, t, n, r, u, o) {
                    var i, a, c;
                    if (void 0 !== t.__d) (i = t.__d), (t.__d = void 0);
                    else if (null == n || u != o || null == u.parentNode)
                        e: if (null == o || o.parentNode !== e) e.appendChild(u), (i = null);
                        else {
                            for (a = o, c = 0; (a = a.nextSibling) && c < r.length; c += 2) if (a == u) break e;
                            e.insertBefore(u, o), (i = o);
                        }
                    return void 0 !== i ? i : u.nextSibling;
                }

                function E(e, t, n) {
                    '-' === t[0] ? e.setProperty(t, n) : (e[t] = null == n ? '' : 'number' != typeof n || f.test(t) ? n : n + 'px');
                }

                function C(e, t, n, r, u) {
                    var o;
                    e: if ('style' === t)
                        if ('string' == typeof n) e.style.cssText = n;
                        else {
                            if (('string' == typeof r && (e.style.cssText = r = ''), r)) for (t in r) (n && t in n) || E(e.style, t, '');
                            if (n) for (t in n) (r && n[t] === r[t]) || E(e.style, t, n[t]);
                        }
                    else if ('o' === t[0] && 'n' === t[1])
                        (o = t !== (t = t.replace(/Capture$/, ''))),
                            (t = t.toLowerCase() in e ? t.toLowerCase().slice(2) : t.slice(2)),
                            e.l || (e.l = {}),
                            (e.l[t + o] = n),
                            n ? r || e.addEventListener(t, o ? P : F, o) : e.removeEventListener(t, o ? P : F, o);
                    else if ('dangerouslySetInnerHTML' !== t) {
                        if (u) t = t.replace(/xlink[H:h]/, 'h').replace(/sName$/, 's');
                        else if ('href' !== t && 'list' !== t && 'form' !== t && 'tabIndex' !== t && 'download' !== t && t in e)
                            try {
                                e[t] = null == n ? '' : n;
                                break e;
                            } catch (e) {}
                        'function' == typeof n || (null != n && (!1 !== n || ('a' === t[0] && 'r' === t[1])) ? e.setAttribute(t, n) : e.removeAttribute(t));
                    }
                }

                function F(e) {
                    this.l[e.type + !1](u.event ? u.event(e) : e);
                }

                function P(e) {
                    this.l[e.type + !0](u.event ? u.event(e) : e);
                }

                function j(e, t, n, r, o, i, a, c, l) {
                    var s,
                        f,
                        d,
                        v,
                        h,
                        y,
                        g,
                        b,
                        O,
                        A,
                        E,
                        C = t.type;
                    if (void 0 !== t.constructor) return null;
                    null != n.__h && ((l = n.__h), (c = t.__e = n.__e), (t.__h = null), (i = [c])), (s = u.__b) && s(t);
                    try {
                        e: if ('function' == typeof C) {
                            if (
                                ((b = t.props),
                                (O = (s = C.contextType) && r[s.__c]),
                                (A = s ? (O ? O.props.value : s.__) : r),
                                n.__c
                                    ? (g = (f = t.__c = n.__c).__ = f.__E)
                                    : ('prototype' in C && C.prototype.render
                                          ? (t.__c = f = new C(b, A))
                                          : ((t.__c = f = new D(b, A)), (f.constructor = C), (f.render = k)),
                                      O && O.sub(f),
                                      (f.props = b),
                                      f.state || (f.state = {}),
                                      (f.context = A),
                                      (f.__n = r),
                                      (d = f.__d = !0),
                                      (f.__h = [])),
                                null == f.__s && (f.__s = f.state),
                                null != C.getDerivedStateFromProps &&
                                    (f.__s == f.state && (f.__s = p({}, f.__s)), p(f.__s, C.getDerivedStateFromProps(b, f.__s))),
                                (v = f.props),
                                (h = f.state),
                                d)
                            )
                                null == C.getDerivedStateFromProps && null != f.componentWillMount && f.componentWillMount(),
                                    null != f.componentDidMount && f.__h.push(f.componentDidMount);
                            else {
                                if (
                                    (null == C.getDerivedStateFromProps && b !== v && null != f.componentWillReceiveProps && f.componentWillReceiveProps(b, A),
                                    (!f.__e && null != f.shouldComponentUpdate && !1 === f.shouldComponentUpdate(b, f.__s, A)) || t.__v === n.__v)
                                ) {
                                    (f.props = b),
                                        (f.state = f.__s),
                                        t.__v !== n.__v && (f.__d = !1),
                                        (f.__v = t),
                                        (t.__e = n.__e),
                                        (t.__k = n.__k),
                                        t.__k.forEach(function (e) {
                                            e && (e.__ = t);
                                        }),
                                        f.__h.length && a.push(f);
                                    break e;
                                }
                                null != f.componentWillUpdate && f.componentWillUpdate(b, f.__s, A),
                                    null != f.componentDidUpdate &&
                                        f.__h.push(function () {
                                            f.componentDidUpdate(v, h, y);
                                        });
                            }
                            (f.context = A),
                                (f.props = b),
                                (f.state = f.__s),
                                (s = u.__r) && s(t),
                                (f.__d = !1),
                                (f.__v = t),
                                (f.__P = e),
                                (s = f.render(f.props, f.state, f.context)),
                                (f.state = f.__s),
                                null != f.getChildContext && (r = p(p({}, r), f.getChildContext())),
                                d || null == f.getSnapshotBeforeUpdate || (y = f.getSnapshotBeforeUpdate(v, h)),
                                (E = null != s && s.type === m && null == s.key ? s.props.children : s),
                                _(e, Array.isArray(E) ? E : [E], t, n, r, o, i, a, c, l),
                                (f.base = t.__e),
                                (t.__h = null),
                                f.__h.length && a.push(f),
                                g && (f.__E = f.__ = null),
                                (f.__e = !1);
                        } else null == i && t.__v === n.__v ? ((t.__k = n.__k), (t.__e = n.__e)) : (t.__e = S(n.__e, t, n, r, o, i, a, l));
                        (s = u.diffed) && s(t);
                    } catch (e) {
                        (t.__v = null), (l || null != i) && ((t.__e = c), (t.__h = !!l), (i[i.indexOf(c)] = null)), u.__e(e, t, n);
                    }
                }

                function w(e, t) {
                    u.__c && u.__c(t, e),
                        e.some(function (t) {
                            try {
                                (e = t.__h),
                                    (t.__h = []),
                                    e.some(function (e) {
                                        e.call(t);
                                    });
                            } catch (e) {
                                u.__e(e, t.__v);
                            }
                        });
                }

                function S(e, t, n, u, o, i, a, c) {
                    var s,
                        f,
                        p,
                        v = n.props,
                        m = t.props,
                        D = t.type,
                        y = 0;
                    if (('svg' === D && (o = !0), null != i))
                        for (; y < i.length; y++)
                            if ((s = i[y]) && (s === e || (D ? s.localName == D : 3 == s.nodeType))) {
                                (e = s), (i[y] = null);
                                break;
                            }
                    if (null == e) {
                        if (null === D) return document.createTextNode(m);
                        (e = o ? document.createElementNS('http://www.w3.org/2000/svg', D) : document.createElement(D, m.is && m)), (i = null), (c = !1);
                    }
                    if (null === D) v === m || (c && e.data === m) || (e.data = m);
                    else {
                        if (((i = i && r.call(e.childNodes)), (f = (v = n.props || l).dangerouslySetInnerHTML), (p = m.dangerouslySetInnerHTML), !c)) {
                            if (null != i) for (v = {}, y = 0; y < e.attributes.length; y++) v[e.attributes[y].name] = e.attributes[y].value;
                            (p || f) && ((p && ((f && p.__html == f.__html) || p.__html === e.innerHTML)) || (e.innerHTML = (p && p.__html) || ''));
                        }
                        if (
                            ((function (e, t, n, r, u) {
                                var o;
                                for (o in n) 'children' === o || 'key' === o || o in t || C(e, o, null, n[o], r);
                                for (o in t)
                                    (u && 'function' != typeof t[o]) ||
                                        'children' === o ||
                                        'key' === o ||
                                        'value' === o ||
                                        'checked' === o ||
                                        n[o] === t[o] ||
                                        C(e, o, t[o], n[o], r);
                            })(e, m, v, o, c),
                            p)
                        )
                            t.__k = [];
                        else if (
                            ((y = t.props.children),
                            _(e, Array.isArray(y) ? y : [y], t, n, u, o && 'foreignObject' !== D, i, a, i ? i[0] : n.__k && h(n, 0), c),
                            null != i)
                        )
                            for (y = i.length; y--; ) null != i[y] && d(i[y]);
                        c ||
                            ('value' in m && void 0 !== (y = m.value) && (y !== e.value || ('progress' === D && !y)) && C(e, 'value', y, v.value, !1),
                            'checked' in m && void 0 !== (y = m.checked) && y !== e.checked && C(e, 'checked', y, v.checked, !1));
                    }
                    return e;
                }

                function B(e, t, n) {
                    try {
                        'function' == typeof e ? e(t) : (e.current = t);
                    } catch (e) {
                        u.__e(e, n);
                    }
                }

                function I(e, t, n) {
                    var r, o;
                    if ((u.unmount && u.unmount(e), (r = e.ref) && ((r.current && r.current !== e.__e) || B(r, null, t)), null != (r = e.__c))) {
                        if (r.componentWillUnmount)
                            try {
                                r.componentWillUnmount();
                            } catch (e) {
                                u.__e(e, t);
                            }
                        r.base = r.__P = null;
                    }
                    if ((r = e.__k)) for (o = 0; o < r.length; o++) r[o] && I(r[o], t, 'function' != typeof e.type);
                    n || null == e.__e || d(e.__e), (e.__e = e.__d = void 0);
                }

                function k(e, t, n) {
                    return this.constructor(e, n);
                }
                (r = s.slice),
                    (u = {
                        __e: function (e, t) {
                            for (var n, r, u; (t = t.__); )
                                if ((n = t.__c) && !n.__)
                                    try {
                                        if (
                                            ((r = n.constructor) &&
                                                null != r.getDerivedStateFromError &&
                                                (n.setState(r.getDerivedStateFromError(e)), (u = n.__d)),
                                            null != n.componentDidCatch && (n.componentDidCatch(e), (u = n.__d)),
                                            u)
                                        )
                                            return (n.__E = n);
                                    } catch (t) {
                                        e = t;
                                    }
                            throw e;
                        }
                    }),
                    (o = 0),
                    (D.prototype.setState = function (e, t) {
                        var n;
                        (n = null != this.__s && this.__s !== this.state ? this.__s : (this.__s = p({}, this.state))),
                            'function' == typeof e && (e = e(p({}, n), this.props)),
                            e && p(n, e),
                            null != e && this.__v && (t && this.__h.push(t), g(this));
                    }),
                    (D.prototype.forceUpdate = function (e) {
                        this.__v && ((this.__e = !0), e && this.__h.push(e), g(this));
                    }),
                    (D.prototype.render = m),
                    (i = []),
                    (a = 'function' == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout),
                    (b.__r = 0);
                var x = 0;

                function N(e, t, n, r, o) {
                    var i,
                        a,
                        c = {};
                    for (a in t) 'ref' == a ? (i = t[a]) : (c[a] = t[a]);
                    var l = {
                        type: e,
                        props: c,
                        key: n,
                        ref: i,
                        __k: null,
                        __: null,
                        __b: 0,
                        __e: null,
                        __d: void 0,
                        __c: null,
                        __h: null,
                        constructor: void 0,
                        __v: --x,
                        __source: r,
                        __self: o
                    };
                    if ('function' == typeof e && (i = e.defaultProps)) for (a in i) void 0 === c[a] && (c[a] = i[a]);
                    return u.vnode && u.vnode(l), l;
                }
            }
        ]);
    }),
    'object' == typeof exports && 'object' == typeof module
        ? (module.exports = t())
        : 'function' == typeof define && define.amd
        ? define([], t)
        : 'object' == typeof exports
        ? (exports.algoliasearchNetlify = t())
        : (e.algoliasearchNetlify = t());
//# sourceMappingURL=algoliasearchNetlify.js.map
