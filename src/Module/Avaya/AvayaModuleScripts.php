<?php

namespace App\MobileEntry\Module\Avaya;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class AvayaModuleScripts implements ComponentAttachmentInterface
{
    /**
     * @var App\Player\PlayerSession
     */
    private $configFetcher;

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
    public function __construct($configFetcher)
    {
        $this->configFetcher = $configFetcher;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        $data = [];
        try {
            $avaya = $this->configFetcher->getConfig('webcomposer_config.avaya_configuration');
            $data['baseUrl'] = $avaya['base_url'] ?? '';
            $data['urlPost'] = $avaya['url_post'] ?? '';
            $data['postTimeout'] = $avaya['url_post_timout'] ?? '';
            $data['jwtKey'] = $avaya['jwt_key'] ?? '';
            $data['validity'] = $avaya['validity_time'] ?? '';
        } catch (\Exception $e) {
            $data = [];
        }

        return $data;
    }
}
