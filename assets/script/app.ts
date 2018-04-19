import {ComponentManager} from '@plugins/ComponentWidget/asset/component';
import {Router} from '@plugins/ComponentWidget/asset/router';

import {HeaderComponent} from '@app/src/Component/Header/script';
import {FooterComponent} from '@app/src/Component/Footer/script';
import {SliderComponent} from '@app/src/Component/Main/Home/Slider/script';
import {ProductListComponent} from '@app/src/Component/Main/Home/ProductList/script';

ComponentManager.setComponents({
    'header': new HeaderComponent(),
    'footer': new FooterComponent(),
    'slider': new SliderComponent(),
    'product_list': new ProductListComponent(),
});

ComponentManager.init();
Router.init();
