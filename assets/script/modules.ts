import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

import {ProductIntegrationModule} from "@app/src/Module/ProductIntegration/script";
import {SessionModule} from "@app/src/Module/Session/script";

ComponentManager.setModules({
    product_integration: new ProductIntegrationModule(),
    session: new SessionModule(),
});
