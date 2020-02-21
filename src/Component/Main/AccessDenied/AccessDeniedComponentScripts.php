<?php

namespace App\MobileEntry\Component\Main\AccessDenied;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\MobileEntry\Services\Product\Products;

/**
 *
 */
class AccessDeniedComponentScripts implements ComponentAttachmentInterface
{
    private $url;

    private $request;

    private $resolver;

    private $lang;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('uri'),
            $container->get('router_request'),
            $container->get('product_resolver'),
            $container->get('lang')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $url,
        $request,
        $resolver,
        $lang
    ) {
        $this->url = $url;
        $this->request = $request;
        $this->resolver = $resolver;
        $this->lang = $lang;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        return [];
    }
}
