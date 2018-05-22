<?php

namespace App\MobileEntry\Component\Main\AccessDenied;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class AccessDeniedComponentScripts implements ComponentAttachmentInterface
{
    private $url;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('uri')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($url)
    {
        $this->url = $url;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        $data['url'] = $this->url->generateUri('404', []);

        return $data;
    }
}
