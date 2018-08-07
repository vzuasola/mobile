import * as utility from "Base/utility";
import multiRegex from "Base/validation/multi-regex";

var validators = { };
var multiRegexPattern = new multiRegex();
/**
 * Default fallback
 */
validators.defaults = {
    callback: function () {
        return true;
    },
};

/**
 * Required
 */
validators.required = {
    callback: function (value, param, field) {
        // this should be moved to the validate.js itself
        if (field && field.type === 'checkbox') {
            return field.checked ? true : false;
        }

        value = value.trim();

        return (
            value !== null &&
            value !== '' &&
            typeof value !== 'undefined'
        );
    },
};

/**
 * Alphanumeric
 */
validators.alphanumeric = {
    callback: function (value, param, field) {
        var regex;

        if (param && parseInt(param[0])) {
            regex = new RegExp("^[ a-zA-Z0-9]+$");
        } else {
            regex = new RegExp("^[a-zA-Z0-9]+$");
        }

        return regex.test(value);
    },
};

/**
 * No Symbols
 */
validators.no_symbols = {
    callback: function (value, param, field) {
        value = utility.trim(value);

        var symbols = ['*', '$', '#', ':', '%', '\\', '/', '<', '>', ';', '&', '|', '='];
        var regex = new RegExp('[' + symbols.join('\\') + ']');

        return value !== '' && !regex.test(value);
    },
};

/**
 * Numeric
 */
validators.numeric = {
    callback: function (value, param, field) {
        value = utility.trim(value);

        var regex = new RegExp("^[0-9]+$");

        return regex.test(value);
    },
};

/**
 * Numeric with special symbols
 */
validators.numeric_symbols = {
    callback: function (value, param, field) {
        value = utility.trim(value);

        var regex = new RegExp("^[0-9.+\\-()]+$");

        return regex.test(value);
    },
};

/**
 * Email
 */
validators.email = {
    callback: function (value, param, field) {
        var regex = new RegExp(/^[\w\_\-\.\w]{1,64}@\w+([\_\-\.]\w+)*\.[a-zA-Z]{2,6}$/i);

        return regex.test(value);
    },
};

/**
 * Min Length
 */
validators.min_length = {
    callback: function (value, param, field) {
        if (field.type === 'checkbox') {
            var items = [];

            for (var i = 0; i < field.element.length; i++) {
                if (field.element[i].checked) {
                    items.push(field.element[i]);
                }
            }

            value = items;
        }

        return value.length >= param[0];
    },
};

/**
 * Max Length
 */
validators.max_length = {
    callback: function (value, param, field) {
        if (field.type === 'checkbox') {
            var items = [];

            for (var i = 0; i < field.element.length; i++) {
                if (field.element[i].checked) {
                    items.push(field.element[i]);
                }
            }

            value = items;
        }

        return value.length <= param[0];
    },
};

/**
 * Alpha
 */
validators.alpha = {
    callback: function (value, param, field) {
        var regex;

        if (param && parseInt(param[0])) {
            regex = new RegExp("^[ a-zA-Z]+$");
        } else {
            regex = new RegExp("^[a-zA-Z]+$");
        }

        return regex.test(value);
    },
};

/**
 * Alpha Multilingual
 */
validators.alpha_multi = {
    callback: function (value, param, field) {
        var pattern = '',
            specialChars = '';
        // check if param is an object
        if (typeof param !== 'undefined') {
            specialChars = param[4].replace(/(\r\n|\n|\r)/gm, "");

            // if spaces are allowed, change the regex to allow spaces
            if (param.hasOwnProperty(0) && param[0] === 1) {
                pattern = pattern + ' ';
            }

            // check if we need to accept numeric
            if (param.hasOwnProperty(1) && param[1] === 1) {
                pattern = pattern + '0-9';
            }

            // check if we need to allow any special characters
            if ((param.hasOwnProperty(2) && param[2] === 1) &&
                (param.hasOwnProperty(3) && param[3] === 0)) {
                pattern = pattern + specialChars;
            }
        }

        var regex = new RegExp('^[' + pattern + multiRegexPattern.multi_regex_pattern() + ']+$');

        if (param !== undefined && param.hasOwnProperty(3) && param[3] === 1) {
            var disallowRegex = new RegExp('[' + specialChars + ']');

            if (disallowRegex.test(value)) {
                return false;
            }

            return true;
        }

        if (!value || regex.test(value)) {
            return true;
        }

        return false;
    },
};


/**
 * Valid Languages
 */
validators.regex = {
    callback: function (value, param, field) {
        return new RegExp(param[0], "i").test(value);
    },
};

/**
 * Valid Date
 */
validators.valid_date = {
    callback: function (value, param, field) {
        var birthdateEl = document.getElementById(field.id);
        var birthDateFormat = birthdateEl.getAttribute('date-format');

        if (birthDateFormat === null) {
            return false;
        }

        birthDateFormat = birthDateFormat.split('/');
        value = value.split('/');

        if (value) {
            return false;
        }

        if (value[3] !== undefined) {
            return false;
        }

        if (value[0] !== undefined && value[1] !== undefined && value[2] !== undefined) {
            if (birthDateFormat[0].length !== value[0].length) {
                return false;
            }

            if (birthDateFormat[1].length !== value[1].length) {
                return false;
            }

            if (birthDateFormat[2].length !== value[2].length) {
                return false;
            }

            var yearMinus18 = new Date().getFullYear() - 18;
            for (var i = 0; i <= birthDateFormat.length - 1; i++) {
                if (birthDateFormat[i] === 'YYYY' && (value[i] > yearMinus18 || parseInt(value[i]) < 1900)) {
                    return false;
                }

                if (birthDateFormat[i] === 'MM' && value[i] > 12) {
                    return false;
                }

                if (birthDateFormat[i] === 'DD' && value[i] > 31) {
                    return false;
                }
            }
        } else {
            return false;
        }
        return true;
    },
};

/**
 * Invalid Words.
 */
validators.invalid_words = {
    callback: function (value, param, field) {
        var obj = param[0].split("\n");
        obj = obj.map(function (x) {
            return x.toUpperCase().trim();
        });
        return (obj.indexOf(value.toUpperCase()) === -1);
    },
};

/**
 * Verify new password.
 */
validators.verify_password = {
    callback: function (value) {
        var newPasswordField = document.querySelector("#ResetPasswordForm_new_password");
        return value === newPasswordField.value;
    }
};



export default validators;
