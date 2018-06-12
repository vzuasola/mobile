<?php

namespace App\MobileEntry\Component\PushNotification;

use App\Utils\IP;
use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class PushNotificationComponentScripts implements ComponentAttachmentInterface
{

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession)
    {
        $this->playerSession = $playerSession;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        return [
            'authenticated' => $this->playerSession->isLogin()
        ];
    }
}
