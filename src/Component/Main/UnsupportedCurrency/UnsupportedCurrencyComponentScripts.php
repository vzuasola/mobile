<?php

namespace App\MobileEntry\Component\Main\UnsupportedCurrency;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class UnsupportedCurrencyComponentScripts implements ComponentAttachmentInterface
{
    private $url;
    private $request;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('uri'),
            $container->get('router_request')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($url, $request)
    {
        $this->url = $url;
        $this->request = $request;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        $data['url'] = $this->url->generateUri('page-not-found', []);
        $data['isMatch'] = trim($this->request->getUri()->getPath(), '/') === 'page-not-found';

        return $data;
    }
}
