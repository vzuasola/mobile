<?php

namespace App\MobileEntry\Module\DesktopRedirect;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\Cookies\Cookies;

/**
 *
 */
class DesktopRedirectModuleScripts implements ComponentAttachmentInterface
{
    const COOKIE = 'X_DEVICE_VIEW';

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        $data = [];

        $data['redirect'] = Cookies::get(self::COOKIE) === 'desktop';

        return $data;
    }
}
