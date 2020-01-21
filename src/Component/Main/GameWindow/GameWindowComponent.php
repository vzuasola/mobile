<?php

namespace App\MobileEntry\Component\Main\GameWindow;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class GameWindowComponent implements ComponentWidgetInterface
{
    private $request;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('router_request')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($request)
    {
        $this->request = $request;
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/GameWindow/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $params = $this->request->getQueryParams();
        return [
            'version' => $params['data-version'] ?? '',
            'operator' => $params['data-operator-id'] ?? '',
            'host' => $params['data-host'] ?? '',
            'currency' => $params['data-query-currency'] ?? '',
            'locale' => $params['data-query-locale'] ?? '',
            'token' => $params['data-query-user-token'] ?? '',
            'script' => $params['script'] ?? '',
        ];
    }
}
