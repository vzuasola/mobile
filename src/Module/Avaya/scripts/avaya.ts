import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

import Storage from "@core/assets/js/components/utils/storage";

/**
 *
 */
export class Avaya {
    private store = new Storage();
    private flag = 0;
    private avayaStorage = "avaya.storage";
    private storageData = {
        expires: 0,
        token: "",
    };
    private options: any = {};

    constructor(options) {
        const defaults = {
            apiUrl: "https://www.cs-livechat.com/s/jwt",
            validity: 1800,
            timeout: 5000,
            nonce: false,
            preFetch: false,
            postFetch: false,
            onSuccess: false,
            onFail: false,
        };

        this.options = options || {};

        for (const name in defaults) {
            if (options[name] === undefined) {
                options[name] = defaults[name];
            }
        }

        // Clear any avaya storage
        this.store.remove(this.avayaStorage);
    }

    /**
     * Trigger the fetch token
     *
     * @return void
     */
    getAvayaToken($e) {
        let token;

        // Block the event when user is spamming
        if (this.flag === 1) {
            return false;
        }

        // Nonce is only created during post-login
        if (this.options.nonce === false) {
            this.store.remove(this.avayaStorage);
            this.triggerCallback("onFail", ["invalid nonce"]);
            return false;
        }

        this.triggerCallback("preFetch", []);

        // Token is still in storage
        token = this.checkStorage();
        if (token !== false) {
            this.triggerCallback("onSuccess", [token]);
            this.flag = 0;
            return false;
        }

        // Fetch a new token
        this.flag = 1;
        this.fetchToken();
    }

    /**
     * Actual request for fetching the token
     *
     * @return Void
     */
    fetchToken() {
        // Fetch the token from avaya api
        xhr({
            url: this.options.apiUrl,
            type: "json",
            method: "post",
            contentType: "text/plain",
            crossOrigin: true,
            timeout: this.options.timeout,
            data: this.options.nonce,
        }).then((response) => {

            if (response.s === undefined) {
                this.triggerCallback("onFail", ["empty token"]);
                return;
            }

            this.triggerCallback("onSuccess", [response.s]);
            this.storeToken(response.s);

        }).fail((err, msg) => {
            this.triggerCallback("onFail", [err, msg]);
        }).always((response) => {
            this.flag = 0;
            this.triggerCallback("postFetch", [response]);
        });
    }

    /**
     * Call listeners to be used for applying into the template
     *
     * @param  string e Event
     * @param  Array args Arguments
     * @return void
     */
    private triggerCallback(e, args) {
        if (typeof this.options[e] === "function") {
            this.options[e].apply(this, args);
        }
    }

    /**
     * Store the fetched token and store it either in the current instance or in the browser
     *
     * @param  string token avaya chat token
     * @return Void
     */
    private storeToken(jwttoken) {
        this.storageData = {
            expires: (this.options.validity * 1000),
            token: jwttoken,
        };

        this.store.set(this.avayaStorage, JSON.stringify(this.storageData));
    }

    /**
     * Check if there is an existing data inside the data storage
     *
     * @return mixed token data or false
     */
    private checkStorage() {
        // Get the local instance storageData
        let data = this.storageData;
        const time = new Date().getTime();

        data = JSON.parse(this.store.get(this.avayaStorage)) || data;

        if (time >= data.expires) {
            this.store.remove(this.avayaStorage);
            return false;
        }

        return data.token;
    }
}
