<?php

namespace App\MobileEntry\Module\GameIntegration;

use App\Drupal\Config;

/**
 * Trait for providers
 */
trait ProviderTrait
{
    public function unsupported($request, $response)
    {
        try {
            $params = $request->getParsedBody();
            $productConfig = $this->config;
            if (isset($params['product'])) {
                $productConfig = $this->config->withProduct($params['product']);
            }

            $data['currency'] = true;
            if (!$this->checkCurrency($request)) {
                $config =  $productConfig->getConfig('webcomposer_config.unsupported_currency');
                $providerMapping = Config::parse($config['game_provider_mapping'] ?? '');
                $data['provider'] = $providerMapping[self::KEY];
                $data['title'] = $config['unsupported_currencies_title'] ?? '';
                $data['message'] = $config['unsupported_currencies_message']['value'] ?? '';
                $data['button'] = $config['unsupported_currencies_button'] ?? '';
                $data['status'] = true;
                $data['currency'] = false;
            }
        } catch (\Exception $e) {
            $data['status'] = false;
            $data['currency'] = false;
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

    public function checkCurrency($request)
    {
        try {
            $params = $request->getParsedBody();
            $productConfig = $this->config;
            if (isset($params['product'])) {
                $productConfig = $this->config->withProduct($params['product']);
            }
            $config =  $productConfig->getConfig('webcomposer_config.icore_games_integration');
            $currencies = explode("\r\n", $config[self::KEY . '_currency']);
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
