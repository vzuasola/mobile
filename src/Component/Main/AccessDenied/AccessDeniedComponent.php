<?php

namespace App\MobileEntry\Component\Main\AccessDenied;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class AccessDeniedComponent implements ComponentWidgetInterface
{
    private $url;

    private $request;

    private $resolver;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('uri'),
            $container->get('router_request'),
            $container->get('product_resolver')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $url,
        $request,
        $resolver
    ) {
        $this->url = $url;
        $this->request = $request;
        $this->resolver = $resolver;
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate($options = [])
    {
        return '@component/Main/AccessDenied/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData($options = [])
    {
        return [];
    }
}
