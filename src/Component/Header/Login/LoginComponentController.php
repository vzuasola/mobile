<?php

namespace App\MobileEntry\Component\Header\Login;

use App\Fetcher\Integration\Exception\AccountLockedException;
use App\Fetcher\Integration\Exception\AccountSuspendedException;

/**
 *
 */
class LoginComponentController
{
    private $rest;
    private $playerSession;
    private $product;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('player_session'),
            $container->get('settings')['product']
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $playerSession, $product)
    {
        $this->rest = $rest;
        $this->playerSession = $playerSession;
        $this->product = $product;
    }

    /**
     *
     */
    public function authenticate($request, $response)
    {
        $data = [];
        $body = $request->getParsedBody();

        if (!empty($body['username']) && !empty($body['password'])) {
            $username = $body['username'];
            $password = $body['password'];

            $options['Login-Product'] = $body['product'] ?? $this->product;

            try {
                $data['success'] = $this->playerSession->login($username, $password, $options);
            } catch (\Exception $e) {
                if ($e instanceof AccountLockedException) {
                    $response = $response->withStatus(403);
                } elseif ($e instanceof AccountSuspendedException) {
                    $response = $response->withStatus(402);
                } elseif ($e->getCode() == 401) {
                    $response = $response->withStatus(401);
                } else {
                    $response = $response->withStatus(500);
                }

                $data['code'] = $e->getCode();
                $data['reason'] = $e->getMessage();
            }
        }

        return $this->rest->output($response, $data);
    }

    /**
     *
     */
    public function logout($request, $response)
    {
        $data = [];

        try {
            $this->playerSession->logout();
        } catch (\Exception $e) {
            // do nothing
        }

        return $this->rest->output($response, $data);
    }
}
