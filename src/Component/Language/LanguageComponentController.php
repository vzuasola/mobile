<?php

namespace App\MobileEntry\Component\Language;

class LanguageComponentController
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

        $data['mobile_language_select'] = $footerConfigs['mobile_language_select'] ?? 'Select Language';

        try {
            $product = $request->getParam('product') ?? 'mobile-entrypage';
            if ($product === 'mobile-sports-df' || $product === 'mobile-sports') {
                $product = 'mobile-entrypage';
            }
            $languageFetcher = $this->language->withProduct($product);
            $data['language'] = $languageFetcher->getLanguages();
            unset($data['language']['default']);
        } catch (\Exception $e) {
            $data['language'] = [];
        }

        return $this->rest->output($response, $data);
    }
}
