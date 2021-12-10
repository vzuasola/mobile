import * as xhr from "@core/assets/js/vendor/reqwest";
import Storage from "@core/assets/js/components/utils/storage";

/**
 *
 */
export class WebRtc {
    private store = new Storage();
    private flag = 0;
    private webrtcStorage = "webrtc.storage";
    private options: any = {};

    private storageData = {
        expires: 0,
        token: "",
    };

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

        // Clear any webrtc storage
        this.store.remove(this.webrtcStorage);
    }

    /**
     * Set JWT Token
     */
    setToken(token) {
        this.options.nonce = token;
    }

    /**
     * Set On Success
     */
    setOnSuccess(success) {
        this.options.onSuccess = success;
    }

    /**
     * Set On Success
     */
    setOnFail(fail) {
        this.options.onFail = fail;
    }

    /**
     * Trigger the fetch token
     *
     * @return void
     */
    getWebRtcToken($e) {
        let token;

        // Block the event when user is spamming
        if (this.flag === 1) {
            return false;
        }

        // Nonce is only created during post-login
        if (this.options.nonce === false) {
            this.store.remove(this.webrtcStorage);
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
     * @param  string token webrtc chat token
     * @return Void
     */
    private storeToken(jwttoken) {
        this.storageData = {
            expires: (this.options.validity * 1000),
            token: jwttoken,
        };

        this.store.set(this.webrtcStorage, JSON.stringify(this.storageData));
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

        data = JSON.parse(this.store.get(this.webrtcStorage)) || data;

        if (time >= data.expires) {
            this.store.remove(this.webrtcStorage);
            return false;
        }

        return data.token;
    }
}
