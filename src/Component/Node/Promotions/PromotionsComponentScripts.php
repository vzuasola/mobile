<?php

namespace App\MobileEntry\Component\Node\Promotions;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class PromotionsComponentScripts implements ComponentAttachmentInterface
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

        $data['countdown'] = $promoConfigs['countdown_format'] ?? "[days] days, [hours] remaining";
        return $data;
    }
}
