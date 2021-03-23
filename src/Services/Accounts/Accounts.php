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
        $check = $store[$product] ?? false;

        if (!isset($check)) {
            try {
                $check = $this->paymentAccount->hasAccount($product, $username);
            } catch (\Throwable $e) {
                // do nothing
            }
        }

        return $check;
    }
}
