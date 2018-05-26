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

    private $languages;

    private $lang;
    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('views_fetcher'),
            $container->get('config_fetcher'),
            $container->get('language_fetcher'),
            $container->get('lang')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($views, $configs, $languages, $lang)
    {
        $this->views = $views;
        $this->configs = $configs;
        $this->languages = $languages;
        $this->lang = $lang;
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
            $promoConfigs = $this->configs->getConfig('mobile_promotions.promotions_configuration');
        } catch (\Exception $e) {
            $promoConfigs = [];
        }

        $data['enable_featured'] = $promoConfigs['enable_featured'] ?? '';
        try {
            foreach ($this->languages->getLanguages() as $language) {
                if ($this->lang == $language['prefix']) {
                    $currentLang = $language['id'];
                    break;
                }
            }

            $data['promotions_filters'] = $this->views->getViewById('promotion-filter', ['langcode' => $currentLang]);
            if ($data['enable_featured']) {
                $featured['field_filter_name'][0]['value'] = $promoConfigs['featured_label'] ?? '';
                $featured['field_product_filter_id'][0]['value'] = 'featured';
                $featured['tid'][0]['value'] = 'featured';
                array_unshift($data['promotions_filters'], $featured);
            }
        } catch (\Exception $e) {
            $data['promotions_filters'] = [];
        }

        $data['title'] = $promoConfigs['title'] ?? 'Promotions';
        $data['filter_label'] = $promoConfigs['filter_label'] ?? 'Filter';
        $data['no_available_promotions'] = $promoConfigs['no_available_msg'] ?? '';

        return $data;
    }
}
