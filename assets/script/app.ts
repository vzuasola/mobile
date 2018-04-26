import {ComponentManager} from '@plugins/ComponentWidget/asset/component';
import {Router, RouterClass} from '@plugins/ComponentWidget/asset/router';

import {HeaderComponent} from '@app/src/Component/Header/script';
import {FooterComponent} from '@app/src/Component/Footer/script';
import {SliderComponent} from '@app/src/Component/Main/Home/Slider/script';
import {ProductsComponent} from '@app/src/Component/Main/Home/Products/script';
import {MenuComponent} from '@app/src/Component/Header/Menu/script';
import {AnnouncementBarComponent} from '@app/src/Component/Announcement/AnnouncementBar/script';
import {AnnouncementLightboxComponent} from '@app/src/Component/Announcement/AnnouncementLightbox/script';

import {Loader} from '@app/assets/script/components/loader';

ComponentManager.setComponents({
    'header': new HeaderComponent(),
    'footer': new FooterComponent(),
    'home_slider': new SliderComponent(),
    'home_products': new ProductsComponent(),
    'header_menu': new MenuComponent(),
    'announcement_bar': new AnnouncementBarComponent(),
    'announcement_lightbox': new AnnouncementLightboxComponent(),
});

let loader = new Loader(document.body, true);

Router.on(RouterClass.beforeNavigate, (event) => {
    loader.show();
});

Router.on(RouterClass.afterNavigate, (event) => {
    loader.hide();
});

Router.on(RouterClass.navigateError, (event) => {
    loader.hide();
});

ComponentManager.init();
Router.init();
