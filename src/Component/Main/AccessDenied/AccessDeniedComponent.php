<?php

namespace App\MobileEntry\Component\Main\AccessDenied;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class AccessDeniedComponent implements ComponentWidgetInterface
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
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/AccessDenied/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $data['is_match'] = trim($this->request->getUri()->getPath(), '/') === 'page-not-found';

        return $data;
    }
}
