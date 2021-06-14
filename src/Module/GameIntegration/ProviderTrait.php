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

        $mapping = Config::parse($isConfigById ? $config['currency'] : $config[self::KEY . '_language_mapping'] ?? '');

        $langCode = "en";
        if (isset($mapping[$language])) {
            $langCode = $mapping[$language];
        }

        return $langCode;
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
}
