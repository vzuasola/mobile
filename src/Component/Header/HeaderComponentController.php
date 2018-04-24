<?php

namespace App\MobileEntry\Component\Header;

/**
 *
 */
class HeaderComponentController
{
    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession)
    {
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
                $data['code'] = $e->getCode();
                $data['reason'] = $e->getMessage();
            }
        }

        return $data;
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

        return $data;
    }
}
