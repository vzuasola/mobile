<?php

namespace App\MobileEntry\Module\GameIntegration\UGL;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Drupal\Config;

class UGLModuleController
{
    use ProviderTrait;

    // key for using settings of PlayerGame API
    const KEY = 'pas';

    const PLAYERGAME_PRODUCTS = [
        'mobile-games',
        'mobile-live-dealer'
    ];

    private $rest;

    private $parser;

    private $config;

    private $player;

    private $playerGameFetcher;

    private $playerSession;

    public $lang;

    public $ptConfig;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('token_parser'),
            $container->get('config_fetcher'),
            $container->get('player'),
            $container->get('player_session'),
            $container->get('player_game_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $rest,
        $parser,
        $config,
        $player,
        $playerSession,
        $playerGameFetcher
    ) {
        $this->rest = $rest;
        $this->parser = $parser;
        $this->config = $config;
        $this->player = $player;
        $this->playerSession = $playerSession;
        $this->playerGameFetcher = $playerGameFetcher;
    }

    /**
     * @{inheritdoc}
     */
    public function launch($request, $response)
    {
        $requestData = $request->getParsedBody();
        $productKey = $requestData['productMap'];
        $configPerProd = $this->config->withProduct($productKey);
        $this->ptConfig = $configPerProd->getConfig('webcomposer_config.games_playtech_provider');
        $this->lang = $requestData['lang'];
        $language = $this->getLanguageMapUGL($this->lang, $this->ptConfig);

        $data['gameurl'] = false;
        $data['currency'] = false;

        if ($this->checkCurrencyUGL($request, $this->ptConfig)) {
            $data['currency'] = true;
            try {
                if (in_array($productKey, self::PLAYERGAME_PRODUCTS)) {
                    $iCoreData = $this->getGameUrlFromICore($request, $requestData);

                    if (isset($iCoreData['errors'])) {
                        return $this->rest->output($response, $iCoreData);
                    }
                }

                $uglConfigs = $this->getParameters($this->ptConfig);

                $playtechGameCode = $requestData['gameCode'];

                $url = $this->ptConfig['ugl_url'] ?? '';

                $search = [
                    '{username}', '{gameCodeName}', '{language}', '{externalToken}', '{playerId}'
                ];

                $replacements = [
                    $this->playerSession->getUsername(),
                    $playtechGameCode,
                    $language,
                    $this->playerSession->getToken(),
                    $this->player->getPlayerID()
                ];

                $url = str_replace($search, $replacements, $url);

                $queryString = [];
                foreach ($uglConfigs as $key => $value) {
                    $param = str_replace($search, $replacements, $value);
                    $queryString[] = $key . "=" . urlencode($this->parser->processTokens($param));
                }

                $url = $url . '?' . implode('&', $queryString);

                $data['gameurl'] = $url;
            } catch (\Exception $e) {
                $data['currency'] = true;
            }
        }

        return $this->rest->output($response, $data);
    }

    /**
     * @{inheritdoc}
     */
    private function getParameters($ptConfig)
    {
        $params = $ptConfig['ugl_parameters'] ?? '';

        if (trim($params) === '') {
            return [];
        }

        $params = Config::parse($params);

        foreach ($params as $key => $param) {
            $params[$key] = $param;
        }

        return $params;
    }

    /**
     * @{inheritdoc}
     */
    private function checkCurrencyUGL($request, $ptConfig)
    {
        try {
            $params = $request->getParsedBody();
            $playerCurrency = $this->player->getCurrency();

            if ($params['currency']) {
                $playerCurrency = $params['currency'];
            }

            $currencies = explode("\r\n", $ptConfig['ugl_currency']);

            if (in_array($playerCurrency, $currencies)) {
                return true;
            }
        } catch (\Exception $e) {
            return false;
        }

        return false;
    }

    /**
     * @{inheritdoc}
     */
    private function getLanguageMapUGL($lang, $ptConfig)
    {
        try {
            $languageMap = [];
            $lines = explode("\r\n", $ptConfig['ugl_languages']);

            foreach ($lines as $line) {
                if (trim($line) === '') {
                    continue;
                }

                list($code, $value) = explode('|', $line);
                $languageMap[$code] = $value;
            }

            return $languageMap[$lang] ?? $lang;
        } catch (\Exception $e) {
            return $lang;
        }
    }

    public function languageCode()
    {
        return $this->getLanguageMapUGL($this->lang, $this->ptConfig);
    }
}
