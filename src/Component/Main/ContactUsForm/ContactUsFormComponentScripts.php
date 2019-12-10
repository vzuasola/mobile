<?php

namespace App\MobileEntry\Component\Main\ContactUsForm;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class ContactUsFormComponentScripts implements ComponentAttachmentInterface
{
    private $configs;
    private $views;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('views_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($configs, $views)
    {
        $this->configs = $configs;
        $this->views = $views;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $configs['data'] = $this->views->getViewById('contact_tabs');
        } catch (\Exception $e) {
            $configs = [];
        }

        return $configs;
    }
}
