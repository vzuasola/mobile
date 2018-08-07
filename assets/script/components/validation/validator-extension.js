import * as utility from "Base/utility";
import detectIE from "Base/browser-detect";

/**
 * Validator extension extends validate.js to add the following:
 *
 * - Per field invokes of clientside validation
 * - Add support for defined events for invoking
 */
export default function ValidatorExtension(validator, events) {
    "use strict";

    var $this = this,
        $fields = {},

        // supported validation events
        $events = ['blur', 'change', 'keyup', 'keydown'];

    /**
     * Constructor
     */
    function construct() {
        $this.populate();

        $events = events || $events;

        for (var field in $fields) {
            if (utility.isNodeList($fields[field].element)) {
                for (var i = $fields[field].element.length - 1; i >= 0; i--) {
                    addEvents($fields[field].element[i]);
                }
            } else {
                addEvents($fields[field].element);
            }
        }
    }

    /**
     *
     */
    function addEvents(elem) {
        // we do this because IE 8 is shitty
        // keydown and keyup does not work properly on radio and checkboxes
        if (detectIE() === 8 && (elem.type === 'radio' || elem.type === 'checkbox')) {
            try {
                utility.addEventListener(elem, 'click', handleEvent);
            } catch (e) {
                console.log(e);
            }
        }

        for (var i = 0; i < $events.length; i++) {
            try {
                utility.addEventListener(elem, $events[i], handleEvent);
            } catch (e) {
                console.log(e);
            }
        }
    }

    /**
     *
     */
    function handleEvent(evt) {
        var name = attributeValue(this, 'name');
        $this.validate(name, evt);
    }

    /**
     *
     */
    this.validate = function (name, evt) {
        validator.errors = [];

        // repopulate
        $this.populate();

        var field = $fields[name];

        // we can still make this conditions simpler
        if (field.depends && typeof field.depends === "function") {
            if (field.depends.call(validator, field)) {
                validator._validateField(field);
            }
        } else if (field.depends &&
            typeof field.depends === "string" &&
            validator.conditionals[field.depends]
        ) {
            if (validator.conditionals[field.depends].call(validator, field)) {
                validator._validateField(field);
            }
        } else {
            validator._validateField(field);
        }

        if (typeof validator.callback === 'function') {
            validator.callback(validator.errors, evt);
        }
    };

    /**
     *
     */
    this.populate = function () {
        for (var key in validator.fields) {
            if (validator.fields.hasOwnProperty(key)) {

                var field = validator.fields[key] || {},
                    element = validator.form[field.name];

                if (element && typeof element !== 'undefined') {
                    field.id = attributeValue(element, 'id');

                    if (element.length > 1) {
                        for (var i = element.length - 1; i >= 0; i--) {
                            field.id = element[i].getAttribute('id');
                        }
                    }

                    field.element = element;
                    field.type = (element.length > 0) ? element[0].type : element.type;
                    field.value = attributeValue(element, 'value');
                    field.checked = attributeValue(element, 'checked');

                    $fields[key] = field;
                }
            }
        }
    };

    /**
     *
     */
    function attributeValue(element, attributeName) {
        if ((element.length > 0) &&
            (element[0].type === 'radio' || element[0].type === 'checkbox')
        ) {
            for (var i = 0, elementLength = element.length; i < elementLength; i++) {
                if (element[i].checked) {
                    return element[i][attributeName];
                }
            }

            return;
        }

        return element[attributeName];
    }

    construct();
}
