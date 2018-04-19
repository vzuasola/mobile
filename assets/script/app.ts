import {ComponentManager} from '@plugins/ComponentWidget/asset/component';
import {Router} from '@plugins/ComponentWidget/asset/router';

import {HeaderComponent} from '@app/src/Component/Header/script';
import {FooterComponent} from '@app/src/Component/Footer/script';
import {SliderComponent} from '@app/src/Component/Main/Home/Slider/script';
import {ProductsComponent} from '@app/src/Component/Main/Home/Products/script';

ComponentManager.setComponents({
    'header': new HeaderComponent(),
    'footer': new FooterComponent(),
    'home_slider': new SliderComponent(),
    'home_products': new ProductsComponent(),
});

ComponentManager.init();
Router.init();
