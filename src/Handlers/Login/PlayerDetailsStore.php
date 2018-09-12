<?php

namespace App\MobileEntry\Handlers\Login;

use App\Player\Player;

/**
 *
 */
class PlayerDetailsStore
{
    /**
     *
     */
    public function __construct($container)
    {
        $this->session = $container->get('secure_session');
        $this->users = $container->get('user_fetcher');
    }

    /**
     *
     */
    public function __invoke()
    {
        $store = [];

        $details = $this->users->getPlayerDetails();

        $this->session->set(Player::CACHE_KEY, $details);
    }
}
