<?php

namespace App\MobileEntry\Component\Node;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class NodeComponentScripts implements ComponentAttachmentInterface
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
            $faqConfigs = $this->config->getConfig('mobile_entrypage.entrypage_configuration');
        } catch (\Exception $e) {
            $promoConfigs = [];
        }

        $data['faqdomain'] = $faqConfigs['faqUrl'] ?? "https://www.dafabet.com/en/faqs";
        return $data;
    }
}
