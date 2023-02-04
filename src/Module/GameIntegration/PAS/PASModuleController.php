<?php

namespace App\MobileEntry\Module\GameIntegration\PAS;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Drupal\Config;
use App\Fetcher\Drupal\ViewsFetcher;
use App\MobileEntry\Services\Accounts\Accounts;

class PASModuleController
{
    use ProviderTrait;

    const KEY = 'pas';

    const CASINO_MAP = [
        'mobile-casino' => 'dafa888',
        'mobile-casino-gold' => 'dafagold',
        'dafaconnect' => 'dafaconnect',
        'sodaconnect' => 'sodaconnect',
        'mobile-live-dealer' => 'dafabetgames',
        'mobile-games' => 'dafabetgames',
        'mobile-entrypage' => 'dafa888',
        'mobile-soda-casino' => 'soda',
    ];

    const BLOCKED_PRODUCTS = [
        'mobile-games',
        'mobile-live-dealer'
    ];

    private $rest;

    /**
     * @var $accountService Accounts
     */
    private $accountService;

    private $parser;

    private $config;

    private $player;

    private $playerSession;

    private $provider;

    /**
     * @var ViewsFetcher $viewsFetcher
     */
    private $viewsFetcher;

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
            $container->get('player_session'),
            $container->get('game_provider_fetcher'),
            $container->get('views_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $rest,
        $accountService,
        $parser,
        $config,
        $player,
        $playerSession,
        $provider,
        $viewsFetcher
    ) {
        $this->rest = $rest;
        $this->accountService = $accountService;
        $this->parser = $parser;
        $this->config = $config->withProduct('mobile-casino');
        $this->player = $player;
        $this->playerSession = $playerSession;
        $this->provider = $provider;
        $this->viewsFetcher = $viewsFetcher->withProduct('mobile-casino');
    }

    public function updateToken($request, $response)
    {
        try {
            $data = [
                'status' => true,
                'username' => $this->playerSession->getUsername(),
                'token' => $this->playerSession->getToken(),
                'currency' => $this->player->getCurrency(),
                'playerId' => $this->player->getPlayerID(),
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
            $data['provisioned'] = $this->accountService->hasAccount(
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

                $playtechGameCode = $requestData['gameCode'];

                // Check if game is blocked (dafabetgames only)
                if (in_array($productKey, self::BLOCKED_PRODUCTS)) {
                    $playtechGameCode = $this->getGameUrlParams($requestData);
                    if (!$playtechGameCode) {
                        throw new \Exception("Blocked");
                    }
                }

                $url = $this->parser->processTokens(
                    $iapiConfigs[$casino][$requestData['platform'] . '_client_url']
                );

                $search = [
                    '{username}', '{gameCode}', '{ptLanguage}', '{langPrefix}',
                ];

                $replacements = [
                    $this->playerSession->getUsername(),
                    $playtechGameCode,
                    $requestData['language'],
                    $requestData['lang'],
                ];

                $url = str_replace($search, $replacements, $url);

                $queryString = [];
                foreach ($iapiConfigs[$casino][$requestData['platform'] . '_param'] as $key => $value) {
                    $param = str_replace($search, $replacements, $value);
                    $queryString[] = $key . "=" . urlencode($this->parser->processTokens($param));
                }
                if ($requestData['product'] == 'mobile-live-dealer' && !empty($requestData['launchAlias'])) {
                    $queryString[] = "launch_alias=" . urlencode($requestData['launchAlias']);
                }
                $url = $url . '?' . implode('&', $queryString);

                $data['gameurl'] = $url;
            } catch (\Exception $e) {
                $data['currency'] = true;
            }
        }

        return $this->rest->output($response, $data);
    }

    private function getGameUrlParams($requestData)
    {
        try {
            // Setup params
            $options['languageCode'] = $requestData['language'];
            $options['playMode']  = 1;
            $gameId = $requestData['gameCode'];
            if (!is_numeric($gameId)) {
                $options['gameName'] = $gameId;
            }

            $responseData = $this->provider->getGameUrlById('icore_pt', $gameId, [
                'options' => $options
            ]);

            if ($responseData['url']) {
                $params = [];
                parse_str(parse_url($responseData['url'])['query'], $params);

                return $params['ExtGameId'];
            }
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Override trait
     *
     */
    private function checkCurrency($request)
    {
        try {
            $params = $request->getParsedBody();
            $playerCurrency = $this->player->getCurrency();
            if ($params['currency']) {
                $playerCurrency = $params['currency'];
            }
            $productConfig = $this->config;
            if (isset($params['product'])) {
                $productConfig = $this->config->withProduct($params['product']);
            }

            $config =  $productConfig->getConfig('webcomposer_config.icore_playtech_provider');
            $currencies = explode("\r\n", $config['dafabetgames_currency']);

            if (in_array($playerCurrency, $currencies)) {
                return true;
            }
        } catch (\Exception $e) {
            // Do nothing
        }
        return false;
    }
}
