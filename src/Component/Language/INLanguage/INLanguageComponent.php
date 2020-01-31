<?php

namespace App\MobileEntry\Component\Language\INLanguage;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class INLanguageComponent implements ComponentWidgetInterface
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
            $container->get('product_resolver'),
            $container->get('config_fetcher'),
            $container->get('language_fetcher'),
            $container->get('lang')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($product, $configs, $language, $currentLanguage)
    {
        $this->configs = $configs;
        $this->language = $language->withProduct($product->getProduct());
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
        return [];
    }
}
