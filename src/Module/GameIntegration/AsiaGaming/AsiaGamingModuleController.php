<?php

namespace App\MobileEntry\Module\GameIntegration\AsiaGaming;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Fetcher\Drupal\ViewsFetcher;
use App\Plugins\Token\Parser;

class AsiaGamingModuleController
{
    use ProviderTrait;

    const KEY = 'asia_gaming';

    private $rest;

    private $asiaGaming;

    private $config;

    private $player;

    private $playerGameFetcher;

    /**
     * @var ViewsFetcher $viewsFetcher
     */
    private $viewsFetcher;

    /**
     * @var Parser
     */
    private $parser;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('game_provider_fetcher'),
            $container->get('config_fetcher'),
            $container->get('player'),
            $container->get('views_fetcher'),
            $container->get('player_game_fetcher'),
            $container->get('token_parser')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $asiaGaming, $config, $player, $viewsFetcher, $playerGameFetcher, Parser $parser)
    {
        $this->rest = $rest;
        $this->asiaGaming = $asiaGaming;
        $this->config = $config->withProduct('mobile-games');
        $this->player = $player;
        $this->viewsFetcher = $viewsFetcher->withProduct('mobile-games');
        $this->playerGameFetcher = $playerGameFetcher;
        $this->parser = $parser;
    }

    private function getGameLobby($request, $response)
    {
        $data['currency'] = true;
        $requestData = $request->getParsedBody();

        try {
            $options['options']['languageCode'] =  $this->languageCode($request);
            if (isset($requestData['gameCode']) && !empty($requestData['gameCode'])) {
                $options['options']['gameCode'] = $requestData['gameCode'];
            }

            $responseData = $this->asiaGaming->getLobby('icore_ag', $options);
            if ($responseData) {
                $data['gameurl'] = $responseData;
            }
        } catch (\Exception $e) {
            $data['currency'] = true;
        }

        return $data;
    }

    private function getGameUrl($request, $response)
    {
        $data['currency'] = true;
        $requestData = $request->getParsedBody();
        $params = explode('|', $requestData['gameCode']);

        try {
            $responseData = $this->asiaGaming->getGameUrlById('icore_ag', $params[0], [
                'options' => [
                    'languageCode' => $this->languageCode($request),
                    'providerProduct' => $params[1] ?? null,
                ]
            ]);
            if ($responseData['url']) {
                $data['gameurl'] = $responseData['url'];
            }
        } catch (\Exception $e) {
            $data['currency'] = true;
        }

        return $data;
    }

    /**
     * ovverdide ProviderTrait Game launching via custom lobby
     */
    public function getGameUrlByPlayerGame($request, $requestData)
    {
        $data['currency'] = true;
        $params = explode('|', $requestData['gameCode']);
        $portalName = $requestData['product'];
        $extGameId = $params[0] ?? '';

        //override extGameId for Direct table launch
        if (isset($requestData['extGameId']) && $requestData['extGameId']
            && $requestData['extGameId'] !== 'undefined') {
            $extGameId = $requestData['extGameId'];
        }

        $extraParams = $this->getPlayerGameExtraParams($requestData);
        $options['options'] = [
            'languageCode' => $this->languageCode($request),
            'playMode' => true
        ];

        if (count($extraParams)) {
            $options['options']['properties'] = $extraParams;
        }

        $playerErrors = $this->getPlayerErrorMessages($request);

        try {
            $responseData =  $this->playerGameFetcher->getGameUrlByExtGameId(
                $portalName,
                $extGameId,
                $options
            );

            if (isset($responseData['body']['url'])) {
                $data['gameurl'] = $responseData['body']['url'];
            } else {
                // placeholder for error code mapping
                $data['errors'] = $this->mappingGameErrors($playerErrors, $responseData);
            }
        } catch (\Exception $e) {
            $data['currency'] = true;
            if ($playerErrors) {
                $data['errors'] = $this->mappingGameErrors($playerErrors, []);
            }
        }

        if ($data && $data['gameurl']) {
            $data['customLobby'] = $this->getCustomLobby($requestData);
        }

        return $data;
    }

    private function getCustomLobby($params)
    {
        $customLobby = null ;
        try {
            $config = $this->config;
            if (isset($params['product'])) {
                $config = $this->config->withProduct($params['product']);
            }

            $config = $config->getConfig('webcomposer_config.icore_games_integration');
            $customLobby = $this->parser->processTokens(
                ($config[self::KEY . '_custom_lobbyDomain_enabled'] ?? false)
                    ? ($config[self::KEY . '_custom_lobbyDomain'] ?? '')
                    : ''
            );
        } catch (\Exception $e) {
            // nothing to do
        }
        return $customLobby;
    }
}
