import * as utility from "Base/utility";

// on include of this class add this event listener immediately
utility.addEventListener(document.body, 'click', onFormReset);

/**
 * On click of the reset button, remove the error icons and error messages
 */
function onFormReset(event) {
    "use strict";

    var evt = event || window.event;
    var target = evt.target || evt.srcElement;
    var type = target.getAttribute('type');

    // only target reset buttons
    if (target.tagName === 'BUTTON' && type === 'reset') {
        var form = utility.findParent(target, 'form');

        var sumbitMessages = form.querySelectorAll('.form-submit-message');

        for (var i = 0; i < sumbitMessages.length; i++) {
            sumbitMessages[i].remove();
        }

        var icons = form.querySelectorAll('.icon-validation');

        for (i = 0; i < icons.length; i++) {
            icons[i].remove();
        }

        var messages = form.querySelectorAll('.form-help-block');

        for (i = 0; i < messages.length; i++) {
            messages[i].remove();
        }
    }
}

/**
 * Error handler class
 *
 * TODO Some hacks are involved
 */
export default function ErrorHandler(errors, event, formValidations) {
    "use strict";

    var $this = this;

    /**
     * Constructor
     */
    function construct() {
        event = event || window.event;

        if (errors.length > 0) {
            for (var i = 0; i < errors.length; i++) {
                var errorElement = errors[i].element;

                $this.showError(errorElement, errors[i].message);
            }

            if (event.type === 'submit') {
                $this.scrollError(event.target || event.srcElement);
            }

        } else {
            var eventElement = event.target || event.srcElement;

            $this.hideError(eventElement);
        }

        // recurse through all the field then check if it has been flag with
        // an error so we can add check icons on it
        // @hack
        if (event.type === 'submit') {
            var form = event.target || event.srcElement;
            var name = form.getAttribute('name');

            var fields = formValidations[name];

            for (var field in fields) {
                var item = name + '[' + field + ']';

                // @see validator.js method 'getRules'
                switch (fields[field]['class']) {
                    case 'App\\Fetcher\\Drupal\\Form\\Checkboxes':
                        item = item + '[]';
                        break;
                }

                var fieldElement = document.querySelector('[name="' + item + '"]');

                if (fieldElement) {
                    var wrapper = utility.findParent(fieldElement, '.form-item');

                    if (!utility.hasClass(wrapper, 'has-error')) {
                        $this.hideError(fieldElement);
                    }
                }
            }
        }
    }

    /**
     *
     */
    this.showError = function (element, message) {
        if (utility.isNodeList(element)) {
            var parent;

            for (var i = 0; i < element.length; i++) {
                parent = element[i].parentNode.parentNode;
            }

            element = parent;
        }

        var field = utility.findParent(element, '.form-item');

        removeErrorMessage(element);

        utility.addClass(field, 'has-error');
        utility.removeClass(field, 'has-success');

        createErrorMessage(element, message);
        createErrorIcon(element);
    };

    /**
     *
     */
    function createErrorIcon(input) {
        var icon = utility.findSibling(input, '.icon-validation'),
            iconSuccess = '<svg class="icon-success" viewbox="0 0 39.19 39.53"><use xlink:href="#check-rounded-thin" xmlns:xlink="http://www.w3.org/1999/xlink"></use></svg>',
            iconError = '<svg class="icon-error" viewbox="0 0 100 100"><use xlink:href="#exclamation-rounded" xmlns:xlink="http://www.w3.org/1999/xlink"></use></svg>';

        if (!icon) {
            var element = document.createElement('span');

            element.className = 'icon-validation';

            element.innerHTML = iconError;
            element.innerHTML += iconSuccess;
            input.parentNode.insertBefore(element, input.nextSibling);

            return element;
        }
    }

    /**
     *
     */
    function createErrorMessage(input, message) {
        var element = document.createElement('span');

        element.className = 'form-help-block tag-color-apple-red';
        element.innerHTML = message;

        // get the error color from the form attributes
        var form = utility.findParent(input, 'form');
        var color = form.getAttribute('error-color');

        if (color) {
            element.style.color = color;
        }

        if (input.type === 'checkbox') {
            input.parentNode.insertBefore(element, null);
        } else {
            input.parentNode.appendChild(element);
        }

        return element;
    }

    /**
     *
     */
    this.hideError = function (element) {
        if (utility.isNodeList(element) ||
            element.type === 'checkbox' ||
            element.type === 'radio'
        ) {
            element = element.parentNode.parentNode;
        }

        var field = utility.findParent(element, '.form-item');

        utility.removeClass(field, 'has-error');
        utility.addClass(field, 'has-success');

        removeErrorMessage(element);
        createErrorIcon(element);
    };

    /**
     *
     */
    function removeErrorMessage(element) {
        var message = utility.findSibling(element, '.form-help-block');

        if (message) {
            message.remove();
        }
    }

    /**
     *
     */
    this.scrollError = function (form) {
        var error = form.querySelector('.has-error');

        if (error) {
            utility.scrollTo(error, 200);
        }
    };

    construct();
}
