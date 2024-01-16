<?php

namespace App\MobileEntry\Module\GameIntegration\UGL;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Drupal\Config;
use App\Fetcher\Drupal\ViewsFetcher;
use App\MobileEntry\Services\Accounts\Accounts;

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

        $data['gameurl'] = false;
        $data['currency'] = false;

        if ($this->checkCurrencyUGL($request, $ptConfig)) {
            $data['currency'] = true;
            try {
                $uglConfigs = $ptConfig['ugl_parameters'] ?? [];

                if ($uglConfigs) {
                    $uglConfigs = Config::parse($uglConfigs);
                    foreach ($uglConfigs as $key => $config) {
                        $uglConfigs[$key] = $config;
                    }
                }

                $playtechGameCode = $requestData['gameCode'];

                $url = $ptConfig['ugl_url'];

                $search = [
                    '{username}', '{gameCodeName}', '{ptLanguage}', '{externalToken}'
                ];

                $replacements = [
                    $this->playerSession->getUsername(),
                    $playtechGameCode,
                    $requestData['language'],
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
            // Do nothing
        }

        return false;
    }
}
