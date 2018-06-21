import {Loader} from "@app/assets/script/components/loader";
import {Splashloader} from "@app/assets/script/components/splash-loader";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";
import {ComponentManager} from "@core/src/Plugins/ComponentWidget/asset/component";

const loader = new Loader(document.body, true);
const splashLoader = new Splashloader(document.body, true);

document.body.setAttribute("style", "");
splashLoader.show();

ComponentManager.subscribe("components.finish", () => {
    splashLoader.hide();
});

Router.on(RouterClass.beforeNavigate, (event) => {
    loader.show();
});

Router.on(RouterClass.afterNavigate, (event) => {
    loader.hide();
});

Router.on(RouterClass.navigateError, (event) => {
    loader.hide();
});
