<?php

namespace App\MobileEntry\Module\GameIntegration;

use App\Drupal\Config;
use App\Player\PlayerInvalidException;

/**
 * Trait for providers
 */
trait ProviderTrait
{
    /**
     * Get the equivalent langCode
     * of current language from iCore
     */
    public function languageCode($request, $key = 'webcomposer_config.icore_games_integration', $isConfigById = false)
    {
        $params = $request->getParsedBody();
        $language = $params['lang'];
        $productConfig = $this->config;
        if (isset($params['product'])) {
            $productConfig = $this->config->withProduct($params['product']);
        }

        $config = $isConfigById ? $productConfig->getGeneralConfigById($key) : $productConfig->getConfig($key);

        $mapping = Config::parse($isConfigById ? $config['languages'] : $config[self::KEY . '_language_mapping'] ?? '');

        $langCode = "en";
        if (isset($mapping[$language])) {
            $langCode = $mapping[$language];
        }

        return $langCode;
    }

    /**
     * Game launching
     */
    public function launch($request, $response)
    {
        $data['gameurl'] = false;
        $data['currency'] = false;

        if ($this->checkCurrency($request)) {
            $requestData = $request->getParsedBody();
            $isLobbyLaunch = ((!$requestData['gameCode'] || $requestData['gameCode'] === 'undefined') ||
            $requestData['lobby'] === "true");
            $directTableLaunch = ($requestData['lobby'] === "true" &&
             ($requestData['gameCode'] !== 'undefined' && $requestData['tableName'] !== 'undefined'));
            if ($this->isPlayerGame($requestData) && (!$isLobbyLaunch || $directTableLaunch)) {
                $data = $this->getGameUrlByPlayerGame($request, $requestData);
            } else {
                $data = $this->getGameUrlByGeneralLobby($request, $requestData);
            }
        }

        return $this->rest->output($response, $data);
    }

    /**
     * Game launching via GeneralLobby
     */
    public function getGameUrlByGeneralLobby($request, $requestData)
    {
        // Gets specific game URL
        if (($requestData['gameCode'] && $requestData['gameCode'] !== 'undefined')
            && $requestData['lobby'] === "false") {
            $data = $this->getGameUrl($request, $requestData);
        }

        // Gets provider game lobby (live-dealer)
        if ((!$requestData['gameCode'] || $requestData['gameCode'] === 'undefined')
            || $requestData['lobby'] === "true") {
            $data = $this->getGameLobby($request, $requestData);
        }

        return $data;
    }

    /**
     * Game launching via PlayerGame
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
        }

        return $data;
    }

    public function getPlayerGameExtraParams()
    {
        return [];
    }

    /**
     * Checks if game launch will use PlayerGame API
     */
    private function isPlayerGame($params)
    {
        try {
            $productConfig = $this->config;
            if (isset($params['product'])) {
                $productConfig = $this->config->withProduct($params['product']);
            }

            $icoreConfig = $productConfig->getConfig('webcomposer_config.icore_games_integration');
            $usePlayerGame = $icoreConfig[self::KEY . '_use_playergame_api'] ?? false;
        } catch (\Exception $e) {
            $usePlayerGame = false;
        }
        return $usePlayerGame;
    }

    public function unsupported($request, $response)
    {
        try {
            $params = $request->getParsedBody();
            $productConfig = $this->config;
            if (isset($params['product'])) {
                $productConfig = $this->config->withProduct($params['product']);
            }
            // Call get currency to check if we have a player session
            $this->player->getCurrency();
            $config =  $productConfig->getConfig('webcomposer_config.unsupported_currency');
            $providerMapping = Config::parse($config['game_provider_mapping'] ?? '');
            $data['provider'] = $providerMapping[self::KEY];
            $data['title'] = $config['unsupported_currencies_title'] ?? '';
            $data['message'] = $config['unsupported_currencies_message']['value'] ?? '';
            $data['button'] = $config['unsupported_currencies_button'] ?? '';
            $data['status'] = true;
        } catch (PlayerInvalidException $e) {
            $productConfig = $this->config->withProduct('mobile-entrypage');
            $loginConfig = $productConfig->getConfig('webcomposer_config.login_timeout');
            $data['title'] = $loginConfig['login_timeout_title'] ?? 'Session Expired';
            $data['message'] = $loginConfig['login_timeout_message']['value'] ?? "<p>Please login again.</p>";
            $data['button'] = $loginConfig['login_timeout_button'] ?? 'ok';
            $data['status'] = true;
        } catch (\Exception $e) {
            $data['status'] = false;
        }

        return $this->rest->output($response, $data);
    }

    public function maintenance($request, $response)
    {
        try {
            $params = $request->getParsedBody();
            $productConfig = $this->config;
            if (isset($params['product'])) {
                $productConfig = $this->config->withProduct($params['product']);
            }
            $config =  $productConfig->getConfig('webcomposer_config.provider_maintenance');
            $providerMapping = Config::parse($config['provider_maitenance_mapping'] ?? '');
            $data['provider'] = $providerMapping[self::KEY];
            $data['title'] = $config['provider_maintenance_title'] ?? '';
            $data['message'] = $config['provider_maintenance_message']['value'] ?? '';
            $data['button'] = $config['provider_maintenance_button'] ?? '';
            $data['status'] = true;
        } catch (\Exception $e) {
            $data['status'] = false;
        }

        return $this->rest->output($response, $data);
    }

    public function checkCurrency($request, $key = 'webcomposer_config.icore_games_integration', $isConfigById = false)
    {
        try {
            $params = $request->getParsedBody();
            $productConfig = $this->config;
            $viewsFetcher = $this->viewsFetcher;
            $playerCurrency = $this->player->getCurrency();
            $subProvider = $params['subprovider'] ?? false;

            //Set Product
            if (isset($params['product'])) {
                $productConfig = $this->config->withProduct($params['product']);
                $viewsFetcher = $this->viewsFetcher->withProduct($params['product']);
            }


            if ($subProvider) {
                $supportedCurrency = $viewsFetcher->getViewById(
                    'games_subproviders',
                    ['name' => $subProvider]
                )[0]['supported_currency'] ?? '';

                // If the game has a subprovider currency restriction, verify if the user met the restriction
                if ($supportedCurrency) {
                    return in_array(
                        $playerCurrency,
                        preg_split("/\r\n|\n|\r/", $supportedCurrency)
                    );
                }
            }

            $config = $isConfigById ? $productConfig->getGeneralConfigById($key)
                : $productConfig->getConfig($key);
            $currencies = $isConfigById ? explode("\r\n", $config['currency'])
                : explode("\r\n", $config[self::KEY . '_currency']);

            if (in_array($playerCurrency, $currencies)) {
                return true;
            }
        } catch (\Exception $e) {
            // Do nothing
        }
        return false;
    }

    /**
     * Get Player Error Messages
     */
    public function getPlayerErrorMessages($request)
    {
        $params = $request->getParsedBody();
        $conf = $this->config;

        if (isset($params['product'])) {
            $conf = $this->config->withProduct($params['product']);
        }

        return $conf->getConfig('webcomposer_config.playergame_error_handling') ?? [];
    }

    /**
     * Mapping error messages.
     */
    public function mappingGameErrors($playerErrorsConfig, $responseData)
    {
        $errorMessage = [];
        $playerErrors = Config::parse($playerErrorsConfig['playergame_error_message']) ?? '';

        if (in_array($responseData['responseCode'], $playerErrors)) {
            $errorMessage['errorCode'] = $playerErrors[$responseData['responseCode']];
            $errorMessage['errorButton'] = $playerErrorsConfig['playergame_error_button'];
        } else {
            $errorMessage['errorCode'] = $playerErrors['500'];
            $errorMessage['errorButton'] = $playerErrorsConfig['playergame_error_button'];
        }

        return $errorMessage;
    }
}
