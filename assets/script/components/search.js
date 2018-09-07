import * as utility from "Base/utility";

/**
 * Filter array of objects by given keyword and specific properties
 *
 * Available Options:
 *     data: The collection of object that will be filtered
 *     fields: The properties of the object that will be used for searching
 *     onSuccess: Function to be executed when theres a result
 *     onFail: Function to be executed when result is empty
 *     onBefore: Function to be executed before the filtering
 *
 * Public methods:
 *     setData(array): Set the collection explicitely overriding the default data passed during object instantiation
 *     search(string): Perform the actual search
 *
 * Usage:
 * var search = new Search({ fields: ['name'] });
 *
 * search.setData([
 *     { name: 'Test 1' },
 *     { name: 'Test 2' }
 * ]);
 *
 * search.search('Test');
 */
export default function Search(options) {
    "use strict";

    var $this = this;

    // default variables
    var defaults = {
        data: null, // array of data to be searched
        fields: null, // array of properties to be searched
        onSuccess: null, // callback function after searching
        onFail: null, // callback function if the search fails
        onBefore: null, // callback function before initiating the search
    };

    /**
     * Constructor
     */
    function construct() {
        setOptions();
    }

    construct();

    /**
     * Initialize options variable
     */
    function setOptions() {
        $this.options = options || {};
        for (var name in defaults) {
            if ($this.options[name] === undefined) {
                $this.options[name] = defaults[name];
            }
        }
    }

    /**
     * Trigger before callback
     */
    function executeBefore(data) {
        if (typeof $this.options.onBefore === 'function') {
            $this.options.onBefore();
        }
    }

    /**
     * Trigger success callback
     * @param array data
     */
    function executeSuccess(data, keyword) {
        if (typeof $this.options.onSuccess === 'function') {
            $this.options.onSuccess(data, keyword);
        }
    }

    /**
     * Trigger fail callback
     * @param string keyword
     */
    function executeFailed(keyword) {
        if (typeof $this.options.onFail === 'function') {
            $this.options.onFail(keyword);
        }
    }

    /**
     * Actual filtering of data
     * @param string keyword [description]
     */
    function filterData(keyword) {
        var data = utility.clone($this.options.data),
            fields = $this.options.fields;

        if (data) {
            // Look for exact keyword matches first
            var filteredData = utility.arrayFilter(data, function (item) {
                var hasMatch = false;

                utility.forEach(fields, function (field, index) {
                    if (item[field]) {
                        var fieldValue = sanitizeField(item[field]),
                            query = sanitizeField(keyword);

                        if (fieldValue.indexOf(query) !== -1) {
                            hasMatch = true;
                            return;
                        }
                    }
                });

                return hasMatch;
            });

            // look for per word matches
            var keywords = utility.clone(keyword).split(' ');
            var tokenMatches = utility.arrayFilter(data, function (item) {
                var hasMatch = false;

                utility.forEach(fields, function (field, index) {
                    utility.forEach(keywords, function (token, index) {
                        if (item[field]) {
                            var fieldValue = sanitizeField(item[field]),
                                query = sanitizeField(token);

                            if (fieldValue.indexOf(query) !== -1) {
                                hasMatch = true;
                                return;
                            }
                        }
                    });

                    if (hasMatch) {
                        return;
                    }
                });

                // look for existning objects from exact keyword matches
                var duplicate = utility.arrayFilter(filteredData, function (existingItem) {
                    if (JSON.stringify(existingItem) === JSON.stringify(item)) {
                        return true;
                    }
                });

                // if dupe found do not include it again
                if (duplicate.length > 0) {
                    return false;
                }

                return hasMatch;
            });

            filteredData = filteredData.concat(tokenMatches);

            if (filteredData.length > 0) {
                executeSuccess(filteredData, keyword);
                return;
            }
        }

        executeFailed(keyword);
    }

    /**
     * Remove whitespace and transform case
     * @param string|object value
     */
    function sanitizeField(value) {
        if (typeof value === 'string') {
            return utility.trim(value.toLowerCase());
        } else if (typeof value === 'object') {
            for (var i = value.length; i--;) {
                value[i] = utility.trim(value[i].toLowerCase());
            }

            return value;
        }
    }

    /**
     * Set the data
     * @param array data
     */
    function setData(data) {
        $this.options.data = data;
    }

    /**
     * Find all objects that has the keyword provided
     * @param  string keyword
     * @return array
     */
    function search(keyword) {
        if (keyword) {
            keyword = utility.trim(keyword);
            $this.options.keyword = keyword;
        } else {
            keyword = $this.options.keyword;
        }

        if (keyword) {
            executeBefore();
            if ($this.options.data) {
                filterData(keyword);
            }
        }
    }

    return {
        setData: setData,
        search: search
    };
}
