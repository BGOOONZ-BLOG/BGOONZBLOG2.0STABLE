(window.webpackJsonp = window.webpackJsonp || []).push([
    [10],
    {
        '6qSS': function (t, e, a) {
            'use strict';
            a.r(e),
                a.d(e, 'default', function () {
                    return u;
                });
            var n = a('dI71'),
                s = a('mwIZ'),
                r = a.n(s),
                l = a('q1tI'),
                o = a.n(l),
                i = a('O+Ac'),
                p = a.n(i),
                m = a('Kvkj'),
                c = a('7Qib'),
                u = (function (t) {
                    function e() {
                        return t.apply(this, arguments) || this;
                    }
                    return (
                        Object(n.a)(e, t),
                        (e.prototype.render = function () {
                            return o.a.createElement(
                                m.a,
                                this.props,
                                o.a.createElement(
                                    'article',
                                    { className: 'post post-full' },
                                    o.a.createElement(
                                        'header',
                                        { className: 'post-header has-gradient outer' },
                                        r()(this.props, 'pageContext.frontmatter.image', null) &&
                                            o.a.createElement('div', {
                                                className: 'bg-img',
                                                style: Object(c.i)(
                                                    "background-image: url('" + Object(c.j)(r()(this.props, 'pageContext.frontmatter.image', null)) + "')"
                                                )
                                            }),
                                        o.a.createElement(
                                            'div',
                                            { className: 'inner-sm' },
                                            o.a.createElement(
                                                'div',
                                                { className: 'post-meta' },
                                                o.a.createElement(
                                                    'time',
                                                    {
                                                        className: 'published',
                                                        dateTime: p()(r()(this.props, 'pageContext.frontmatter.date', null)).strftime('%Y-%m-%d %H:%M')
                                                    },
                                                    p()(r()(this.props, 'pageContext.frontmatter.date', null)).strftime('%B %d, %Y')
                                                )
                                            ),
                                            o.a.createElement('h1', { className: 'post-title' }, r()(this.props, 'pageContext.frontmatter.title', null)),
                                            r()(this.props, 'pageContext.frontmatter.subtitle', null) &&
                                                o.a.createElement(
                                                    'div',
                                                    { className: 'post-subtitle' },
                                                    Object(c.f)(r()(this.props, 'pageContext.frontmatter.subtitle', null))
                                                )
                                        )
                                    ),
                                    o.a.createElement(
                                        'div',
                                        { className: 'inner-md outer' },
                                        o.a.createElement('div', { className: 'post-content' }, Object(c.f)(r()(this.props, 'pageContext.html', null)))
                                    )
                                )
                            );
                        }),
                        e
                    );
                })(o.a.Component);
        }
    }
]);
//# sourceMappingURL=component---src-templates-post-js-d6ee8a7502d16baf00c6.js.map
