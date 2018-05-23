<?php

namespace App\MobileEntry\Component\Language;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class LanguageComponent implements ComponentWidgetInterface
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


    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('language_fetcher'),
            $container->get('lang')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($configs, $language, $currentLanguage)
    {
        $this->configs = $configs;
        $this->language = $language;
        $this->currentLanguage = $currentLanguage;
    }


    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Language/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
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
            $data['language'] = $this->language->getLanguages();
            unset($data['language']['default']);
        } catch (\Exception $e) {
            $data['language'] = [];
        }

        return $data;
    }
}
