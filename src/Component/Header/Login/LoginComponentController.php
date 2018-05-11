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
    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $playerSession)
    {
        $this->rest = $rest;
        $this->playerSession = $playerSession;
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

            try {
                $data['success'] = $this->playerSession->login($username, $password);
            } catch (\Exception $e) {
                if ($e instanceof AccountLockedException) {
                    $response = $response->withStatus(403);
                }

                if ($e instanceof AccountSuspendedException) {
                    $response = $response->withStatus(402);
                }

                if ($e->getCode() == 401) {
                    $response = $response->withStatus(401);
                }

                if ($e->getCode() == 500) {
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
