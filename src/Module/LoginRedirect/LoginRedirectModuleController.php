<?php

namespace App\MobileEntry\Module\LoginRedirect;

class LoginRedirectModuleController
{
    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('views_fetcher'),
            $container->get('rest'),
            $container->get('uri')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($views, $rest, $uri)
    {
        $this->views = $views;
        $this->rest = $rest;
        $this->uri = $uri;
    }

    public function process($request, $response)
    {
        $data = [];
        $body = $request->getParsedBody();

        try {
            if (isset($body['url'])) {
                $url = base64_decode($body['url']);
                $data['url'] = $this->uri->generateUri($url, []);
            }
        } catch (\Exception $e) {
            // do nothing
        }

        return $this->rest->output($response, $data);
    }
}
