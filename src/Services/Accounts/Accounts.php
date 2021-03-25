<?php

namespace App\MobileEntry\Services\Accounts;

use App\Fetcher\Integration\PaymentAccountFetcher;

/**
 * Class to check for accounts
 */
class Accounts
{
    /** @var $paymentAccount PaymentAccountFetcher */
    private $paymentAccount;
    private $session;

    /**
     * Container resolver
     */
    public static function create($container)
    {
        return new static(
            $container->get('payment_account_fetcher'),
            $container->get('session')
        );
    }

    /**
     *
     */
    public function __construct($paymentAccount, $session)
    {
        $this->paymentAccount = $paymentAccount;
        $this->session = $session;
    }

    /**
     * @param $product
     * @param null $username
     * @return bool
     */
    public function hasAccount($product, $username = null)
    {
        $store = $this->session->get('accounts.products') ?? [];
        // If there is a session return immediately
        if (isset($store[$product])) {
            return $store[$product];
        }
        // Else, fetch from the API the result
        try {
            return $this->paymentAccount->hasAccount($product, $username);
        } catch (\Throwable $e) {
            return false;
        }
    }
}
