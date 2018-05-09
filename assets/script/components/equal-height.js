import * as utility from '@core/assets/js/components/utility';

function EqualHeight(selector) {
    this.init = function () {
        var elements = document.querySelectorAll(selector);
        var maxHeight = this.getHeights(elements);

        utility.forEach(elements, function (elem) {
            elem.style.height = maxHeight + "px";
        });
    };

    this.getHeights = function (elems) {
        var maxHeight = 0;

        utility.forEach(elems, function (elem) {
            var elemHeight = elem.offsetHeight;

            if (elemHeight > maxHeight) {
                maxHeight = elemHeight;
            }
        });

        return maxHeight;
    };
}

export default EqualHeight;
