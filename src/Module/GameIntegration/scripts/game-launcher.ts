import * as utility from "@core/assets/js/components/utility";

import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

import {GameInterface} from "./game.interface";

import SyncEvents from "@core/assets/js/components/utils/sync-events";
import * as Promise from "promise-polyfill";

class GameLauncher {
    private providers: {[name: string]: GameInterface} = {};
    private prelaucnhEvents: any = [];
    private sync: SyncEvents = new SyncEvents();

    /**
     *
     */
    setProvider(id: string, provider: GameInterface) {
        this.providers[id] = provider;
    }

    launch(provider: string, options: {[name: string]: string} = {}) {
        options.provider = provider;

        const launchSequence = this.prelaucnhEvents.slice(0);

        launchSequence.push(() => {
            return new Promise((resolve, reject) => {
                if (options.loader === "true") {
                    ComponentManager.broadcast("game.launch.loader", {
                        options,
                    });
                } else {
                    this.invoke(provider, "launch", [options]);
                }

                resolve();
            });
        });

        this.sync.executeWithArgsWithException(launchSequence, [options]);
    }

    /**
     *
     */
    init() {
        this.bindEvents();
        this.activateLoginHooks();
        this.listenPreloginEvents();
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
            this.onLogin(event, data.src);
        });

        ComponentManager.subscribe("session.logout", (event, src, data) => {
            this.invokeAll("logout");
        });
    }

    private activateLoginHooks() {
        setTimeout(() => {
            for (const key in this.providers) {
                if (this.providers.hasOwnProperty(key)) {
                    const provider = this.providers[key];
                    if (typeof this.providers[key].login === "function") {
                        ComponentManager.broadcast("session.events.push", {
                            event: (username, password) => {
                                return provider.login(username, password);
                            },
                        });
                    }

                    if (typeof this.providers[key].prelaunch === "function") {
                        ComponentManager.broadcast("game.prelaunch.push", {
                            event: (options) => {
                                return provider.prelaunch(options);
                            },
                        });
                    }
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
        const el = utility.find(src, (element) => {
            if (utility.hasClass(src, "game-favorite", true)) {
                return false;
            }

            if (element.getAttribute("data-game-provider") &&
                element.getAttribute("data-game-launch") === "true"
            ) {
                return true;
            }
        });

        if (el) {
            e.preventDefault();

            const provider = el.getAttribute("data-game-provider");
            const options = this.getOptionsByElement(el);

            options.provider = provider;

            this.launch(provider, options);

            ComponentManager.broadcast("game.launch", {
                src: el,
            });
        }
    }

    /**
     *
     */
    private onLogin(e, src) {
        const el = utility.find(src, (element) => {
            if (element.getAttribute("data-game-provider")) {
                return true;
            }
        });

        if (el) {
            e.preventDefault();

            const provider = el.getAttribute("data-game-provider");
            const options = this.getOptionsByElement(el);

            options.provider = provider;

            this.launch(provider, options);

            ComponentManager.broadcast("game.launch", {
                src: el,
            });
        }
    }

    /**
     * Listen for events that the login form must wait before doing the
     * actual login
     */
    private listenPreloginEvents() {
        // Allows you to push new loginEvents
        //
        // Available options
        //
        // event: closure => the actual encapsulated promise that will hold the event
        ComponentManager.subscribe("game.prelaunch.push", (event, src, data) => {
            if (data && typeof data.event !== "undefined") {
                this.prelaucnhEvents.push(data.event);
            }
        });
    }
}

const launcher = new GameLauncher();
export {launcher as GameLauncher};
