<?php

namespace App\MobileEntry\Component\Main\Promotions;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class PromotionsComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\ViewsFetcher
     */
    private $views;
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $config;
    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('views_fetcher'),
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($views, $configs)
    {
        $this->views = $views;
        $this->configs = $configs;
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/Promotions/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        try {
            $data['promotions_filters'] = $this->views->getViewById('promotion-filter');
        } catch (\Exception $e) {
            $data['promotions_filters'] = [];
        }

        try {
            $promoConfigs = $this->configs->getConfig('mobile_promotions.promotions_configuration');
            $data['title'] = $promoConfigs['title'];
            $data['filter_label'] = $promoConfigs['filter_label'];

        } catch (\Exception $e) {
            $data['title'] = 'Promotions';
            $data['filter_label'] = 'Filter';
        }

        return $data;
    }
}
