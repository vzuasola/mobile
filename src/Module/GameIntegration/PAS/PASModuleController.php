<?php

namespace App\MobileEntry\Module\GameIntegration\PAS;

class PASModuleController
{
    private $rest;

    /**
     * @var App\Fetcher\Integration\PaymentAccountFetcher
     */
    private $paymentAccount;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('payment_account_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $paymentAccount)
    {
        $this->rest = $rest;
        $this->paymentAccount = $paymentAccount;
    }

    /**
     * @{inheritdoc}
     */
    public function subaccounts($request, $response)
    {
        $data = [];
        try {
            $data['provisioned'] = 
                $this->paymentAccount->hasAccount('casino-gold', $request->getQueryParam('username'));
        } catch (\Exception $e) {
            $data = [];
        }
        return $this->rest->output($response, $data);
    }
}
