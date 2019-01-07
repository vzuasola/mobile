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

    private $parser;

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
            $container->get('token_parser'),
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
        $parser,
        $config,
        $player
    ) {
        $this->rest = $rest;
        $this->paymentAccount = $paymentAccount;
        $this->parser = $parser;
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

    /**
     * @{inheritdoc}
     */
    public function launch($request, $response)
    {
        $data['gameurl'] = false;
        $data['currency'] = false;
        if ($this->checkCurrency()) {
            $data['currency'] = true;
            $requestData = $request->getParsedBody();

            try {
                $config = $this->config->withProduct('mobile-entrypage');
                $ptConfig = $config->getConfig('webcomposer_config.games_playtech_provider');

                $iapiConfigs = $ptConfig['iapiconf_override'] ?? [];
                if ($iapiConfigs) {
                    $iapiConfigs = Config::parse($iapiConfigs);
                    foreach ($iapiConfigs as $key => $config) {
                        $iapiConfigs[$key] = json_decode($config, true);
                    }
                }

                $url = $this->parser->processTokens($iapiConfigs['dafa888'][$requestData['options']['platform'] . '_client_url']);

                $search = [
                    '{gameCode}', '{ptLanguage}', '{langPrefix}',
                ];

                $replacements = [
                    $requestData['options']['code'], $requestData['language'], $requestData['lang'],
                ];

                $queryString = "";
                foreach ($iapiConfigs['dafa888'][$requestData['options']['platform'] . '_param'] as $key => $value) {
                    $param = str_replace($search, $replacements, $value);
                    $queryString .= $key . '=' .urlencode($this->parser->processTokens($param)) . '&';
                }
                $url = $url . "?$queryString";

                $data['gameurl'] = $url;
            } catch (\Exception $e) {
                $data = [];
            }
        }

        return $this->rest->output($response, $data);
    }

    private function checkCurrency()
    {
        try {
            $config =  $this->config->getConfig('webcomposer_config.icore_playtech_provider');
            $currencies = explode("\r\n", $config['dafabetgames_currency']);
            $playerCurrency = $this->player->getCurrency();

            if (in_array($playerCurrency, $currencies)) {
                return true;
            }
        } catch (\Exception $e) {
            // Do nothing
        }
        return false;
    }
}
