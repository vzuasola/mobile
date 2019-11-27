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
            $container->get('uri'),
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($views, $rest, $uri, $playerSession)
    {
        $this->views = $views;
        $this->rest = $rest;
        $this->uri = $uri;
        $this->playerSession = $playerSession;
    }

    public function process($request, $response)
    {
        $data = [];
        $body = $request->getParsedBody();
        $matrix = $this->playerSession->getDetails()['isPlayerCreatedByAgent'] ?? false;
        if ($matrix) {
            return $this->rest->output($response, $data);
        }

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
