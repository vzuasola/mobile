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

            $options = [];

            if (!empty($body['product'])) {
                $options['header']['Login-Product'] = $body['product'];
            }

            try {
                $responseHeaders = $response->getHeaders();
                if (isset($responseHeaders['X-Page-Error-Type'][0])
                    && strtolower($responseHeaders['X-Page-Error-Type'][0]) === 'restricted') {
                    throw new \Exception("Country Restricted", 421);
                }

                $data['success'] = $this->playerSession->login($username, $password, $options);
                $data['hash'] = md5($this->playerSession->getToken());
                $data['token'] = $this->playerSession->getToken();
            } catch (\Exception $e) {
                if ($e instanceof AccountLockedException) {
                    $response = $response->withStatus(403);
                } elseif ($e instanceof AccountSuspendedException) {
                    $response = $response->withStatus(402);
                } elseif ($e->getCode() == 401) {
                    $response = $response->withStatus(401);
                } elseif ($e->getCode() == 421) {
                    $response = $response->withStatus(421);
                } else {
                    $response = $response->withStatus(500);
                }

                $reason = $e->getMessage();
                $data['code'] = $e->getCode();
                $data['reason'] = $reason;

                $reasonArray = explode('response:', $reason);
                if (!empty($reasonArray)) {
                    if (isset($reasonArray[1])) {
                        $data['reasonJson'] = json_decode($reasonArray[1]);
                    } else {
                        $data['reasonJson'] = $reason;
                    }
                }
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
            $data['success'] = $this->playerSession->logout();
        } catch (\Exception $e) {
            $data['message'] = $e->getMessage();
        }

        return $this->rest->output($response, $data);
    }
}
