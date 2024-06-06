import * as utility from "Base/utility";
import Dropdown from "Base/dropdown";
import Storage from "Base/utils/storage";

/**
 * Dropdown country code
 */
export default function optinCountryAreaCode() {
    // @param tabindex made global for proper increment
    var tabindex = 1;
    var storage = new Storage();

    init();

    function init() {
        var countrySelector = getAllCountryClass('.country-code'),
            countCountrySelector = 0,
            inputElements = [],
            dataCountrys = [],
            countDataCountry = 0;

        if (countrySelector.length > 0) {
            for (countCountrySelector; countCountrySelector < countrySelector.length; countCountrySelector++) {
                dataCountrys.push(getDataCountry(countrySelector[countCountrySelector]));
                inputElements.push(countrySelector[countCountrySelector]);
                setInputHidden(countrySelector[countCountrySelector]);
            }
        }

        if (dataCountrys.length > 0) {
            var fragment = [],
                list = [];

            for (countDataCountry; countDataCountry < dataCountrys.length; countDataCountry++) {
                if (dataCountrys[countDataCountry]) {
                    eventListeners(inputElements[countDataCountry], list, countDataCountry);

                    generateMarkup(fragment, list, countDataCountry, dataCountrys[countDataCountry].split("\n"), inputElements[countDataCountry]);

                    createTrigger(list, countDataCountry, 'number-' + countDataCountry);

                    setActive('', list, countDataCountry, 'number-' + countDataCountry);

                    new Dropdown({
                        selector: '.country-area-code-' + countDataCountry + ' .trigger-' + countDataCountry,
                        hideDropdownOnClick: true
                    });

                    setIndexAttribute(countDataCountry);
                }
            }
        }
    }

    function getAllCountryClass(selectorClass) {
        return document.querySelectorAll(selectorClass);
    }

    function getDataCountry(formTag) {
        return utility.findParent(formTag, 'form').getAttribute('data-country');
    }

    function eventListeners(inputElement, list, countDataCountry) {
        utility.addEventListener(utility.findParent(inputElement, '.form-field'), 'click', function (e) {
            var target = utility.getTarget(e),
                listItem = target.tagName === 'LI' ? target : utility.findParent(target, 'li');

            if (listItem) {
                setActive(listItem, list, countDataCountry, 'number-' + countDataCountry);
            }

            setSearchFocus('number-' + countDataCountry, target);
        });

        utility.addEventListener(document, 'keyup', function (e) {
            if (utility.findParent(e.srcElement, 'div')) {
                if (!utility.findParent(e.srcElement, 'div').getAttribute('data-index')) {
                    return;
                }

                var target = utility.getTarget(e),
                    input = document.querySelector('.country-search-' + utility.findParent(e.srcElement, 'div').getAttribute('data-index')),
                    items = utility.nextElementSibling(input).getElementsByTagName('li');

                if (target === input) {
                    var term = target.value.toLowerCase();

                    utility.forEach(items, function (item) {
                        var countryName = item.querySelector('.country-name').innerHTML;

                        if (countryName.toLowerCase().indexOf(term)) {
                            item.style.display = 'none';
                        } else {
                            item.style.display = 'block';
                        }
                    });
                }

                if (utility.findParent(target, '.country-dropdown-' + countDataCountry) && e.keyCode === 13) {
                    var selectedDropdown = document.querySelector('.country-dropdown-' + countDataCountry);

                    setActive(target, list, utility.findParent(target, '.country-dropdown-' + countDataCountry, 1).getAttribute('data-index'), 'number-' + countDataCountry);

                    selectedDropdown.style.height = '0px';
                    utility.removeClass(selectedDropdown, 'active');
                }
            }
        });
    }

    function generateMarkup(fragment, list, countDataCountry, dataCountry, inputElement) {
        if (!document.querySelector('.country-area-code-' + countDataCountry)) {
            var container = document.createElement('div'),
                placeholder = inputElement.getAttribute('placeholder') ? inputElement.getAttribute('placeholder') : '';
            utility.addClass(container, 'country-dropdown-' + countDataCountry);

            var searchBox = document.createElement('input');
            searchBox.setAttribute('type', 'text');
            utility.addClass(searchBox, 'country-search-' + countDataCountry);
            searchBox.setAttribute('tabindex', tabindex);

            var UIHidden = document.createElement('input');
            UIHidden.setAttribute('type', 'hidden');
            UIHidden.setAttribute('id', 'country-code-' + countDataCountry);

            var UIText = document.createElement('input');
            UIText.setAttribute('type', 'text');
            UIText.setAttribute('class', 'form-field-element');
            UIText.setAttribute('id', 'number-' + countDataCountry);
            UIText.setAttribute('placeholder', placeholder);

            fragment[countDataCountry] = document.createDocumentFragment();
            list[countDataCountry] = document.createElement('ul');

            utility.forEach(dataCountry, function (item, i) {
                var listItem = document.createElement('li'),
                    span = document.createElement('span');

                listItem.setAttribute('tabindex', tabindex + 1);
                item = item.split("|");

                var code = item[0],
                    name = '<em class="country-name">' + item[1] + '</em>',
                    num = '<em class="country-num">+' + item[2] + '</em>';

                span.innerHTML = name + num;
                listItem.appendChild(span);
                utility.addClass(listItem, code.toLowerCase());

                fragment[countDataCountry].appendChild(listItem);
                tabindex++;
            });

            list[countDataCountry].appendChild(fragment[countDataCountry]);
            inputElement.parentNode.insertBefore(container, inputElement);
            container.appendChild(UIHidden);
            inputElement.parentNode.insertBefore(UIText, inputElement);

            utility.addEventListener(UIText, 'keyup', function (e) {
                setNumber(e, countDataCountry, inputElement);
            });

            container.appendChild(searchBox);
            container.appendChild(list[countDataCountry]);
            utility.addClass(container.parentNode, 'country-area-code-' + countDataCountry);
        }
    }

    function createTrigger(list, countDataCountry, inputElement) {
        var trigger = document.createElement('span');
        utility.addClass(trigger, 'trigger-' + countDataCountry);

        list[countDataCountry].parentNode.parentNode.insertBefore(trigger, document.querySelector('.country-dropdown-' + countDataCountry));

        setTimeout(function () {
            adjustInputPadding(list, countDataCountry, inputElement);
        }, 1000);
    }

    function adjustInputPadding(list, countDataCountry, inputElement) {
        var trigger = utility.previousElementSibling(list[countDataCountry].parentNode);
        var padding = trigger.offsetWidth ? trigger.offsetWidth : trigger.clientWidth;

        document.getElementById(inputElement).setAttribute('style', 'padding-left:' + padding + 'px !important;');
    }

    function setActive(elementList, list, countDataCountry, inputElement) {
        var inputtedNumber = '';
        var useCode = {};
        var hasValue = getCountryCodeIndex(countDataCountry); // retrieved stored data

        if (hasValue && !elementList) {
            // get the country-code and inputted number based on stored data
            // switch flag and set mobile number field based on stored data
            useCode = splitRetrievedNumber(countDataCountry, hasValue);
            switchFlag(useCode.icon, useCode.countryCode, list, countDataCountry);
            setMobileNumberField(useCode.inputtedNumber, countDataCountry);
        } else if (elementList) {
            elementList.tagName === 'LI' ? elementList : utility.findParent(elementList, 'li');

            var countryCode = elementList.getAttribute('class'),
                number = elementList.querySelector('.country-num').innerHTML;

            switchFlag(countryCode, number, list, countDataCountry);

            // onchange of dropdown field
            // get old data and inputted number
            // update form field of dropdown to a new value
            var newValue = getCountryCodeIndex(countDataCountry);

            if (newValue) {
                useCode = splitRetrievedNumber(countDataCountry, newValue);
            }

            if (useCode.inputtedNumber) {
                inputtedNumber = useCode.inputtedNumber;
            }

            updateHiddenMobileNumber(countDataCountry, number, inputtedNumber);

            // set country code on local storage country-code-{index}
            setCountryCodeIndex(countDataCountry, number.length);
        } else {
            switchFlag('', '+00', list, countDataCountry);

            // remove stored country-code-{index} by default
            removeCountryCodeIndex(countDataCountry);
        }

        adjustInputPadding(list, countDataCountry, inputElement);
    }

    function switchFlag(countryCode, number, list, countDataCountry) {
        var trigger = utility.previousElementSibling(list[countDataCountry].parentNode);
        trigger.className = countryCode;
        utility.addClass(trigger, 'trigger-' + countDataCountry);
        trigger.innerHTML = number;

        setUIHidden(countDataCountry, number);
    }

    /**
     * Update form field value of country-code
     * @param  {int} elementIndex [form field index]
     * @param  {string} countryCode  [(+) sign and country code]
     * @param  {int} mobileNumber [inputted mobile number]
     * @return {string} [country code + mobile number]
     */
    function updateHiddenMobileNumber(elementIndex, countryCode, mobileNumber) {
        var mobileField = document.querySelectorAll('.country-code')[elementIndex];
        mobileField.value = countryCode + mobileNumber;
    }

    /**
     * Set form field value of country-code
     * @param {int} number [inputted mobile number w/o country code]
     * @param {int} index  [form field index]
     */
    function setMobileNumberField(number, index) {
        document.getElementById('number-' + index).value = number;
    }

    function setUIHidden(countDataCountry, number) {
        document.getElementById('country-code-' + countDataCountry).value = number;
    }

    function setIndexAttribute(countDataCountry) {
        if (document.querySelector('.country-dropdown-' + countDataCountry)) {
            document.querySelector('.country-dropdown-' + countDataCountry).setAttribute('data-index', countDataCountry);
        }
    }

    function setSearchFocus(inputElement, targetElement) {
        if (targetElement && utility.nextElementSibling(targetElement)) {
            var indexTargetSibling = utility.nextElementSibling(targetElement).getAttribute('data-index');
        }

        if (utility.hasClass(targetElement, 'trigger-' + indexTargetSibling)) {
            document.querySelector('.country-search-' + indexTargetSibling).focus();
            document.querySelector('.country-dropdown-' + indexTargetSibling).style.maxWidth = document.getElementById(inputElement).offsetWidth + 'px';
            document.querySelector('.country-dropdown-' + indexTargetSibling).style.minWidth = document.getElementById(inputElement).offsetWidth + 'px';
        }
    }

    function setNumber(e, countDataCountry, inputElement) {
        if (document.getElementById('number-' + countDataCountry) && document.getElementById('country-code-' + countDataCountry)) {
            var value = document.getElementById('country-code-' + countDataCountry) ? document.getElementById('country-code-' + countDataCountry).value : '';
            var value1 = document.getElementById('number-' + countDataCountry) ? document.getElementById('number-' + countDataCountry).value : '';
            inputElement.value = value + value1;
        }
    }

    function setInputHidden(inputElement) {
        inputElement.setAttribute('type', 'hidden');
    }

    /**
     * Retrive country code index from local storage, if mobile number field has value
     * @param  {int} elementIndex [form field index]
     * @return country-code class|country-code length or false
     */
    function getCountryCodeIndex(elementIndex) {
        var existing = storage.get('country-code-index-' + elementIndex);
        var mobileNumber = retrieveMobileNumber(elementIndex);

        if (existing && mobileNumber) {
            return existing;
        }

        return false;
    }

    /**
     * Retrieve class name of icon and store with length of country code to use on splitting using substring
     * @param {int} elementIndex [form field index]
     * @param {int} index [length of selected country code]
     */
    function setCountryCodeIndex(elementIndex, index) {
        var flag = document.querySelector('.trigger-' + elementIndex);

        if (flag) {
            var attr = utility.getAttributes(flag, 'class');
            var rplc = attr.class.replace('trigger-' + elementIndex, '');
        }

        storage.set('country-code-index-' + elementIndex, index + '|' + rplc);
    }

    /**
     * Remove country-code-{index} data from local storage
     * @param  {int} elementIndex [form field index]
     */
    function removeCountryCodeIndex(elementIndex) {
        storage.remove('country-code-index-' + elementIndex);
    }

    /**
     * split retrieved data from localstorage
     * @param  {int} elementIndex [form field index]
     * @param  {string} countryCode [data retrieved from localstorage (country-code-{index})]
     * @return {object} returns country code, inputted number, icon
     */
    function splitRetrievedNumber(elementIndex, countryCode) {
        var split = countryCode.split('|');

        var result = {};
        var mobileNumberValue = retrieveMobileNumber(elementIndex);

        if (mobileNumberValue) {
            result = {
                'countryCode': mobileNumberValue.substring(0, split[0]),
                'inputtedNumber': mobileNumberValue.substring(split[0]),
                'icon': split[1]
            };
        }

        return result;
    }

    /**
     * Get submitted mobile number
     * @param  {int} index [country-code field index]
     * @return concatenated country code and mobile number field value or false
     */
    function retrieveMobileNumber(index) {
        var mobileNumber = document.querySelectorAll('.country-code')[index];
        return mobileNumber.value || false;
    }
}
