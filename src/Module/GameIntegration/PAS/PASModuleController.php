<?php

namespace App\MobileEntry\Module\GameIntegration\PAS;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Drupal\Config;

class PASModuleController
{
    use ProviderTrait;

    const KEY = 'pas';

    const CASINO_MAP = [
        'mobile-casino' => 'dafa888',
        'mobile-casino-gold' => 'dafagold',
        'dafaconnect' => 'dafaconnect',
        'mobile-live-dealer' => 'dafa888',
    ];

    private $rest;

    /**
     * @var App\Fetcher\Integration\PaymentAccountFetcher
     */
    private $paymentAccount;

    private $parser;

    private $config;

    private $player;

    private $playerSession;

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
            $container->get('player'),
            $container->get('player_session')
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
        $player,
        $playerSession
    ) {
        $this->rest = $rest;
        $this->paymentAccount = $paymentAccount;
        $this->parser = $parser;
        $this->config = $config->withProduct('mobile-casino');
        $this->player = $player;
        $this->playerSession = $playerSession;
    }

    public function updateToken($request, $response)
    {
        try {
            $data = [
                'status' => true,
                'username' => $this->playerSession->getUsername(),
                'token' => $this->playerSession->getToken(),
                'currency' => $this->player->getCurrency(),
            ];
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
        $requestData = $request->getParsedBody();
        $data['gameurl'] = false;
        $data['currency'] = false;

        if ($this->checkCurrency($request)) {
            $data['currency'] = true;
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

                $productKey = $requestData['productMap'];
                $casino = self::CASINO_MAP[$productKey];

                $url = $this->parser->processTokens(
                    $iapiConfigs[$casino][$requestData['options']['platform'] . '_client_url']
                );

                $search = [
                    '{username}', '{gameCode}', '{ptLanguage}', '{langPrefix}',
                ];

                $replacements = [
                    $this->playerSession->getUsername(),
                    $requestData['options']['code'],
                    $requestData['language'],
                    $requestData['lang'],
                ];

                $url = str_replace($search, $replacements, $url);

                $queryString = [];
                foreach ($iapiConfigs[$casino][$requestData['options']['platform'] . '_param'] as $key => $value) {
                    $param = str_replace($search, $replacements, $value);
                    $queryString[] = $key . "=" . urlencode($this->parser->processTokens($param));
                }
                $url = $url . '?' . implode('&', $queryString);

                $data['gameurl'] = $url;
            } catch (\Exception $e) {
                $data = [];
            }
        }

        return $this->rest->output($response, $data);
    }

    /**
     * Override trait
     *
     */
    public function unsupported($request, $response)
    {
        try {
            $data['currency'] = true;

            if (!$this->checkCurrency($request)) {
                $data['currency'] = false;
                $productConfig = $this->config;
                if (isset($params['product'])) {
                    $productConfig = $this->config->withProduct($params['product']);
                }
                $config =  $productConfig->getConfig('webcomposer_config.unsupported_currency');
                $providerMapping = Config::parse($config['game_provider_mapping'] ?? '');
                $data['provider'] = $providerMapping[self::KEY];
                $data['title'] = $config['unsupported_currencies_title'] ?? '';
                $data['message'] =
                    $config['unsupported_currencies_message']['value'] ?? '';
                $data['button'] = $config['unsupported_currencies_button'] ?? '';
                $data['status'] = true;
            }
        } catch (\Exception $e) {
            $data['status'] = false;
            $data['currency'] = false;
        }

        return $this->rest->output($response, $data);
    }

    /**
     * Override trait
     *
     */
    private function checkCurrency($request)
    {
        try {
            $params = $request->getParsedBody();
            $playerCurrency = $params['currency'];
            $productConfig = $this->config;
            if (isset($params['product'])) {
                $productConfig = $this->config->withProduct($params['product']);
            }

            $config =  $productConfig->getConfig('webcomposer_config.icore_playtech_provider');
            $currencies = explode("\r\n", $config['dafabetgames_currency']);
            if (!$playerCurrency) {
                $playerCurrency = $this->player->getCurrency();
            }

            if (in_array($playerCurrency, $currencies)) {
                return true;
            }
        } catch (\Exception $e) {
            // Do nothing
        }
        return false;
    }
}
