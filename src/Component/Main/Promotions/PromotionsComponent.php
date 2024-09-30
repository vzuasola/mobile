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

    private $request;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('views_fetcher'),
            $container->get('config_fetcher'),
            $container->get('router_request')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($views, $configs, $request)
    {
        $this->views = $views;
        $this->configs = $configs;
        $this->request = $request;
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

        $params = $this->request->getQueryParams();
        $data['is_embed'] = (isset($params['flutter']) && $params['flutter'] === '1');
        $data['title'] = $promoConfigs['title'] ?? 'Promotions';
        $data['filter_label'] = $promoConfigs['filter_label'] ?? 'Filter';
        $data['no_available_promotions'] = $promoConfigs['no_available_msg'] ?? '';
        $data['no_archive_promotions'] = $promoConfigs['no_archive_msg'] ?? '';
        $data['btn_archive_title'] = $promoConfigs['btn_archive_title']
            ?? 'View Past Promotions';
        $data['show_archive'] = $promoConfigs['show_archive'] ?? true;
        return $data;
    }
}
