/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
! function(e, t) {
    if ('object' == typeof exports && 'undefined' != typeof module) {
        module.exports = t();
    } else {
        'function' == typeof define && define.amd ? define(t) : (e = 'undefined' != typeof globalThis ? globalThis : e || self).reframe = t();
    }
}(this, function() {
    'use strict';
    return function(e, t) {
        var i;
        var n;
        var o = 'string' == typeof e ? document.querySelectorAll(e) : e;
        var r = t || 'js-reframe';
        'length' in o || (o = [o]);
        for (var d = 0; d < o.length; d += 1) {
            var f = o[d];
            if (-1 !== f.className.split(' ').indexOf(r) || -1 < f.style.width.indexOf('%')) return;
            var l = f.getAttribute('height') || f.offsetHeight;
            var s = f.getAttribute('width') || f.offsetWidth;
            var a = ('string' == typeof l ? parseInt(l) : l) / ('string' == typeof s ? parseInt(s) : s) * 100;
            var p = document.createElement('div');
            p.className = r;
            var u = p.style;
            u.position = 'relative', u.width = '100%', u.paddingTop = ''.concat(a, '%');
            var h = f.style;
            h.position = 'absolute', h.width = '100%', h.height = '100%', h.left = '0', h.top = '0', null !== (i = f.parentNode) && void 0 !== i && i.insertBefore(p, f), null !== (n = f.parentNode) && void 0 !== n && n.removeChild(f), p.appendChild(f);
        }
    };
});