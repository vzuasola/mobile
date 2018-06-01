<?php

namespace App\MobileEntry\Handlers\Logout;

/**
 *
 */
class Accounts
{
    private $session;

    public function __construct($container)
    {
        $this->session = $container->get('session');
    }

    /**
     *
     */
    public function __invoke()
    {
        $this->session->delete('accounts.products');
    }
}
