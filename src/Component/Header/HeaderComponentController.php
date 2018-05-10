<?php

namespace App\MobileEntry\Component\Header;

/**
 *
 */
class HeaderComponentController
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
        $this->rest = $rest;
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
                $data['code'] = $e->getCode();
                $data['reason'] = $e->getMessage();
                $response = $response->withStatus($e->getCode());
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
