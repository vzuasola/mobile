import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

import {SessionModule} from "@app/src/Module/Session/script";

ComponentManager.setModules({
    session: new SessionModule(),
});
