<?php

namespace App\MobileEntry\Component\PushNotification;

/**
 *
 */
class PushNotificationComponentController
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
}
