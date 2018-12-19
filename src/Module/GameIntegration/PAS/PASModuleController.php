<?php

namespace App\MobileEntry\Module\GameIntegration\PAS;

use App\Drupal\Config;

class PASModuleController
{
    const KEY = 'pas';

    private $rest;

    /**
     * @var App\Fetcher\Integration\PaymentAccountFetcher
     */
    private $paymentAccount;

    private $pas;

    private $config;

    private $player;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('accounts_service'),
            $container->get('game_provider_fetcher'),
            $container->get('config_fetcher'),
            $container->get('player')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $rest,
        $paymentAccount,
        $pas,
        $config,
        $player
    ) {
        $this->rest = $rest;
        $this->paymentAccount = $paymentAccount;
        $this->pas = $pas;
        $this->config = $config->withProduct('mobile-casino');
        $this->player = $player;
    }

    public function unsupported($request, $response)
    {
        try {
            $config =  $this->config->getConfig('webcomposer_config.unsupported_currency');
            $providerMapping = Config::parse($config['game_provider_mapping'] ?? '');
            $data['provider'] = $providerMapping[self::KEY];
            $data['title'] = $config['unsupported_currencies_title'] ?? '';
            $data['message'] =
                $config['unsupported_currencies_message']['value'] ?? '';
            $data['button'] = $config['unsupported_currencies_button'] ?? '';
            $data['status'] = true;
        } catch (\Exception $e) {
            $data['status'] = false;
        }

        return $this->rest->output($response, $data);
    }

    /**
     * @{inheritdoc}
     */
    public function subaccounts($request, $response)
    {
        $data = [];

        try {
            $data['provisioned'] = $this->paymentAccount->hasAccount(
                'casino-gold',
                $request->getQueryParam('username')
            );
        } catch (\Exception $e) {
            $data = [];
        }

        return $this->rest->output($response, $data);
    }

    public function checkCurrency($request, $response)
    {
        $data = [];
        try {
            $config =  $this->config->getConfig('webcomposer_config.icore_playtech_provider');
            $currencies = explode("\r\n", $config['dafabetgames_currency']);
            $playerCurrency = $this->player->getCurrency();

            if (in_array($playerCurrency, $currencies)) {
                $data['currency'] = true;
                return $this->rest->output($response, $data);
            }
        } catch (\Exception $e) {
            $data['currency'] = false;
        }

        $data['currency'] = false;
        
        return $this->rest->output($response, $data);
    }
}
