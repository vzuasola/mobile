<?php

namespace App\MobileEntry\Component\TabNavigation;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class TabNavigationComponentScripts implements ComponentAttachmentInterface
{
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
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($config)
    {
        $this->config = $config;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        $data = [];

        try {
            $promoConfigs = $this->config->getConfig('mobile_promotions.promotions_configuration');
        } catch (\Exception $e) {
            $promoConfigs = [];
        }

        $data['filterLabel'] = $promoConfigs['filter_label'] ?? 'Filter';
        $data['countdown'] = $promoConfigs['countdown_format'] ?? "[days] days, [hours] remaining";

        return $data;
    }
}
