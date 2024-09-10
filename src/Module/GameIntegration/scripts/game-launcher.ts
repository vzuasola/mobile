import * as utility from "@core/assets/js/components/utility";

import { ComponentManager } from "@plugins/ComponentWidget/asset/component";

import { GameInterface } from "./game.interface";

class GameLauncher {
    private providers: { [name: string]: GameInterface } = {};

    /**
     *
     */
    setProvider(id: string, provider: GameInterface) {
        this.providers[id] = provider;
    }

    launch(provider: string, options: { [name: string]: string } = {}) {
        options.provider = provider;

        this.invoke(provider, "prelaunch", [options]);
        this.invoke(provider, "launch", [options]);
    }

    /**
     *
     */
    init() {
        this.bindEvents();
        this.activateLoginHooks();
    }

    /**
     *
     */
    private bindEvents() {
        utility.ready(() => {
            this.invokeAll("init");
        });

        ComponentManager.subscribe("click", (event, src) => {
            this.onClick(event, src);
        });

        ComponentManager.subscribe("session.login", (event, src, data) => {
            this.onLogin(event, data);
        });

        ComponentManager.subscribe("session.logout", (event, src, data) => {
            this.invokeAll("logout");
        });
    }

    private activateLoginHooks() {
        setTimeout(() => {
            for (const key in this.providers) {
                if (this.providers.hasOwnProperty(key) &&
                    typeof this.providers[key].login === "function"
                ) {
                    const provider = this.providers[key];

                    ComponentManager.broadcast("session.events.push", {
                        event: (username, password) => {
                            return provider.login(username, password);
                        },
                    });
                }
            }
        }, 100);
    }

    /**
     *
     */
    private invoke(id: string, method: string, args: any = []) {
        if (typeof this.providers[id][method] === "function") {
            this.providers[id][method].apply(this.providers[id], args);
        }
    }

    /**
     *
     */
    private invokeAll(method: string, args: any = []) {
        for (const key in this.providers) {
            if (typeof this.providers[key][method] === "function") {
                this.providers[key][method].apply(this.providers[key], args);
            }
        }
    }

    /**
     *
     */
    private getOptionsByElement(element) {
        const options: any = {};
        const attributes = utility.getAttributes(element);

        for (const attr in attributes) {
            if (attr.indexOf("data-game", 0) === 0) {
                const key = attr.replace("data-game-", "");
                options[key] = attributes[attr];
            }
        }

        return options;
    }

    /**
     *
     */
    private onClick(e, src) {
        let loader = false;
        let redirect = false;
        const el = utility.find(src, (element) => {
            if (element.getAttribute("data-game-redirection")) {
                redirect = true;
                return true;
            }

            if (utility.hasClass(src, "game-favorite", true)) {
                return false;
            }

            if (element.getAttribute("data-game-loader") === "true" &&
                element.getAttribute("data-game-launch") === "true"
            ) {
                loader = true;
                return true;
            }

            if (element.getAttribute("data-game-provider") &&
                element.getAttribute("data-game-launch") === "true"
            ) {
                return true;
            }
        });

        if (el) {
            e.preventDefault();
            this.sendGameLaunchEvents(el, e, redirect, loader);
        }
    }

    /**
     * Send events based on
     * game launching point of entry (ie promotions, game loader or game iframe)
     * @param el
     * @param event
     * @param redirect
     * @param loader
     * @param data
     * @returns
     */
    private sendGameLaunchEvents(el, event, redirect, loader, data = {response: {}}) {
        let eventLaunch = "game.launch";
        let eventLoader = "game.launch.loader";
        const options = this.getOptionsByElement(el);
        const params = {
            src: el,
            response: {},
        };

        if (data.hasOwnProperty("response")) {
            params.response = data.response;
        }

        if (redirect) {
            ComponentManager.broadcast("game.redirect", {
                options,
            });

            return;
        }

        // Send launch event for game launch from promotions
        if (options.hasOwnProperty("launchpromo") && options.launchpromo === "true") {
             eventLoader = "game.launch.promo.loader";
             eventLaunch = "game.promo.launch";
             options.currentProduct = options.product;
        }

        ComponentManager.broadcast(eventLaunch, params);

        if (!loader) {
            const provider = el.getAttribute("data-game-provider");

            options.provider = provider;
            this.invoke(provider, "prelaunch", [options]);
            this.invoke(provider, "launch", [options]);
        } else {
            // Send launch event for game launch using Game Loader Launcher
            ComponentManager.broadcast(eventLoader, {
                options,
            });
        }
    }

    /**
     *
     */
    private onLogin(e, data) {
        let loader = false;
        let redirect = false;
        const el = utility.find(data.src, (element) => {
            if (element.getAttribute("data-game-redirection")) {
                redirect = true;
                return true;
            }

            if (element.getAttribute("data-game-loader") === "true") {
                loader = true;
                return true;
            }

            if (element.getAttribute("data-game-provider")) {
                return true;
            }
        });

        if (el) {
            this.sendGameLaunchEvents(el, e, redirect, loader, data);
        }
    }
}

const launcher = new GameLauncher();
export { launcher as GameLauncher };
