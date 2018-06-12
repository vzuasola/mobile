<?php

namespace App\MobileEntry\Handlers\Login;

/**
 *
 */
class Accounts
{
    const PRODUCTS = ['casino-gold'];

    private $accountService;
    private $session;

    public function __construct($container)
    {
        $this->accountService = $container->get('accounts_service');
        $this->session = $container->get('session');
    }

    /**
     *
     */
    public function __invoke()
    {
        $this->session->delete('accounts.products');

        $store = [];

        foreach (self::PRODUCTS as $key) {
            $result = $this->accountService->hasAccount($key);

            if (isset($result)) {
                $store[$key] = $result;
            }
        }

        if (!empty($store)) {
            $this->session->set('accounts.products', $store);
        }
    }
}
