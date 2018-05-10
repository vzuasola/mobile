import * as utility from "@core/assets/js/components/utility";
import {GameLaunch} from "./game-launch";

export class GameLauncher {
    private providers: {[name: string]: GameLaunch};

    /**
     *
     */
    public setProvider(id: string, provider: GameLaunch) {
        this.providers[id] = provider;
    };

    
    public launch(provider: string, options: {[name: string]: string} = {}) {
        options["provider"] = provider;

        this.invoke(provider, "prelaunch", [options]);
        this.invoke(provider, "launch", [options]);
    }

    /**
     *
     */
    private init() {
        this.bindEvents();
    };

    /**
     *
     */
    private bindEvents() {
        utility.ready(function () {
            this.invokeAll("init");
        });

        utility.addEventListener(document, "click", onClick);
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
        let options = {};
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
    private onClick(e) {
        const target = utility.getTarget(e);

        if (target.getAttribute("data-game-launch") === "true" &&
            target.getAttribute("data-game-provider")
        ) {
            var provider = target.getAttribute("data-game-provider");
            var options = this.getOptionsByElement(target);

            options["provider"] = provider;

            this.invoke(provider, "prelaunch", [options]);
            this.invoke(provider, "launch", [options]);
        }
    }

}
