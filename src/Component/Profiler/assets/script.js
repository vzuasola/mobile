(function () {
    if (localStorage.getItem('profiler.tab.state') === 'compact') {
        hideProfilerBar('compact');
    } else {
        hideProfilerBar('full');
    }
})();

function doProfiler(target) {
    var element = document.querySelector(target);

    if (element.style.display === 'none') {
        element.style.display = 'block';
    } else {
        element.style.display = 'none';
    }
}

function hideProfilerBar(state) {
    if (state === 'compact') {
        localStorage.setItem('profiler.tab.state', 'compact');

        document.querySelector('.profiler-tab.compact').style.display = 'block';
        document.querySelector('.profiler-tab.full').style.display = 'none';
    } else {
        localStorage.setItem('profiler.tab.state', 'full');

        document.querySelector('.profiler-tab.compact').style.display = 'none';
        document.querySelector('.profiler-tab.full').style.display = 'block';
    }
}

// var trace = document.querySelectorAll('.profiler-content .message');
// var accordions = document.querySelectorAll('.profiler-content .trace');

// for (var i = 0; i < trace.length; i++) {
//     trace[i].onclick = function (event) {
//         var accordion = sibling(this.parentNode, '.trace');
//         expandAccordion(accordion);

//         event.preventDefault();
//     }
// }

// function collapseAccordion() {
//     for (var i = 0; i < accordions.length; i++) {
//         removeClass(accordions[i], 'active');
//     }

//     content.style.height = height + 'px';
// }

// function expandAccordion(el) {
//     if (hasClass(el, 'active')) {
//         removeClass(el, 'active');
//         collapseAccordion();
//     } else {
//         collapseAccordion();
//         addClass(el, 'active');
//         maxHeight = document.querySelector('.profiler-content-inner').scrollHeight;
//         content.style.height = maxHeight + 'px';
//     }
// }

// Helper Methods

function addClass(el, className) {
    if (el) {
        if (el.classList) {
            el.classList.add(className);
        } else if (!hasClass(el, className)) {
            el.className += " " + className;
        }
    }
};

function hasClass(el, className) {
    if (el) {
        if (el.classList) {
            return el.classList.contains(className);
        } else {
            return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
        }
    }
};

function removeClass(el, className) {
    if (el && hasClass(el, className)) {
        if (el && el.classList) {
            el.classList.remove(className);
        } else if (hasClass(el, className)) {
            var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
            el.className = el.className.replace(reg, ' ');
        }
    }
};

function hasCollection(a, b) {
    for (var i = 0, len = a.length; i < len; i++) {
        if (a[i] === b) {
            return true;
        }
    }

    return false;
};

function sibling(el, selector) {
    var all = document.querySelectorAll(selector);
    var sibling = siblings(el);

    for (var i = 0; i < sibling.length; i++) {
        if (hasCollection(all, sibling[i])) {
            return sibling[i];
        }
    }
};

function siblings(el) {
    var siblings = el.parentNode.children;
    var elementSiblings = [];

    for (var i = 0, len = siblings.length; i < len; i++) {
        if (siblings[i].nodeType === 1) {
            elementSiblings.push(siblings[i]);
        }
    }

    for (i = elementSiblings.length; i--;) {
        if (elementSiblings[i] === el) {
            elementSiblings.splice(i, 1);
            break;
        }
    }

    return elementSiblings;
}
