<?php

namespace App\MobileEntry\Services\Accounts;

/**
 * Class to check for accounts
 */
class Accounts
{
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
     *
     */
    public function hasAccount($product, $username = null)
    {
        $store = $this->session->get('accounts.products') ?? [];
        $check = $store[$product] ?? null;

        if (!isset($check)) {
            try {
                $check = $this->paymentAccount->hasAccount($product, $username);
            } catch (\Exception $e) {
                // do nothing
            }
        }

        return $check;
    }
}
