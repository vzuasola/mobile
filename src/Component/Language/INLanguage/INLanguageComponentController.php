<?php

namespace App\MobileEntry\Component\Language\INLanguage;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class INLanguageComponentController
{
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var App\Fetcher\Drupal\language
     */
    private $language;

    private $currentLanguage;

    private $rest;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;


    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('product_resolver'),
            $container->get('config_fetcher'),
            $container->get('language_fetcher'),
            $container->get('lang'),
            $container->get('rest'),
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $product,
        $configs,
        $language,
        $currentLanguage,
        $rest,
        $playerSession
    ) {
        $this->configs = $configs;
        $this->language = $language->withProduct($product->getProduct());
        $this->currentLanguage = $currentLanguage;
        $this->rest = $rest;
        $this->playerSession = $playerSession;
    }


    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function language($request, $response)
    {
        $data = [];

        $data['currentLanguage'] = $this->currentLanguage;

        try {
            $footerConfigs = $this->configs->getConfig('webcomposer_config.footer_configuration');
        } catch (\Exception $e) {
            $footerConfigs = [];
        }

        try {
            $entrypageConfigs = $this->configs->getConfig('mobile_entrypage.entrypage_configuration');
        } catch (\Exception $e) {
            $entrypageConfigs = [];
        }

        $data['mobile_india_language_select'] = $entrypageConfigs['mobile_language_select'] ?? 'Select your Language';
        $data['mobile_india_language_description'] =
            $entrypageConfigs['mobile_language_description_select'] ?? '';

        $data['mobile_language_select'] = $footerConfigs['mobile_language_select'] ?? 'Select Language';

        try {
            $data['language'] = $this->language->getLanguages();
            unset($data['language']['default']);
        } catch (\Exception $e) {
            $data['language'] = [];
        }

        $data['partnerMatrix'] = $this->playerSession->getDetails()['isPlayerCreatedByAgent'] ?? false;

        return $this->rest->output($response, $data);
    }
}
