<?php

namespace App\MobileEntry\Module\GameIntegration\UGL;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Drupal\Config;

class UGLModuleController
{
    use ProviderTrait;

    const KEY = 'ugl';

    private $rest;

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
        $parser,
        $config,
        $player,
        $playerSession
    ) {
        $this->rest = $rest;
        $this->parser = $parser;
        $this->config = $config;
        $this->player = $player;
        $this->playerSession = $playerSession;
    }

    /**
     * @{inheritdoc}
     */
    public function launch($request, $response)
    {
        $requestData = $request->getParsedBody();
        $productKey = $requestData['productMap'];
        $configPerProd = $this->config->withProduct($productKey);
        $ptConfig = $configPerProd->getConfig('webcomposer_config.games_playtech_provider');
        $language = $this->getLanguageMapUGL($requestData['lang'], $ptConfig);

        $data['gameurl'] = false;
        $data['currency'] = false;

        if ($this->checkCurrencyUGL($request, $ptConfig)) {
            $data['currency'] = true;
            try {
                $uglConfigs = $this->getParameters($ptConfig);

                $playtechGameCode = $requestData['gameCode'];

                $url = $ptConfig['ugl_url'] ?? '';

                $search = [
                    '{username}', '{gameCodeName}', '{language}', '{externalToken}'
                ];

                $replacements = [
                    $this->playerSession->getUsername(),
                    $playtechGameCode,
                    $language,
                    $this->playerSession->getToken()
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
}
