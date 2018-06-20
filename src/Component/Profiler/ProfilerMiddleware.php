<?php

namespace App\MobileEntry\Component\Profiler;

use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Interop\Container\ContainerInterface;

use Slim\Http\Stream;

use App\Plugins\Middleware\ResponseMiddlewareInterface;

/**
 *
 */
class ProfilerMiddleware implements ResponseMiddlewareInterface
{
    private $components;
    private $request;
    private $settings;

    /**
     * Public constructor
     *
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container)
    {
        $this->components = $container->get('component_widget_manager');
        $this->request = $container->get('request');
        $this->settings = $container->get('settings');
    }

    /**
     *
     */
    public function handleResponse(RequestInterface &$request, ResponseInterface &$response)
    {
        if ($this->settings->get('debug')) {
            $template = '<div class="profiler"></div>';
            $body = (string)$response->getBody();

            if (strpos($body, $template) !== false) {
                $profiler = $this->components->renderWidget('profiler', ['response' => $response]);

                $body = str_replace($template, $profiler, $body);

                $stream = fopen('php://memory', 'r+');
                fwrite($stream, $body);

                $newStream = new Stream($stream);

                $response = $response->withBody($newStream);
            }
        }
    }
}
