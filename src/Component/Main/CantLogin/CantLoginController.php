<?php

namespace App\MobileEntry\Component\Main\CantLogin;

/**
 *
 */
class CantLoginController
{
    const ERROR_CODE = [
        'INT001' => 'INTERNAL_ERROR',
        'INT033' => 'FORGOT_PASSWORD_SUCCESS',
        'INT034' => 'FORGOT_PASSWORD_FAILED',
        'INT035' => 'FORGOT_USERNAME_SUCCESS',
        'INT036' => 'FORGOT_USERNAME_FAILED',
        'INT037' => 'CHANGE_FORGOTTEN_PASSWORD_SUCCESS',
        'INT038' => 'CHANGE_FORGOTTEN_PASSWORD_FAILED'
    ];

    private $rest;
    private $userFetcher;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('user_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $userFetcher)
    {
        $this->rest = $rest;
        $this->userFetcher = $userFetcher;
    }

    /**
     *
     */
    public function forgotPassword($request, $response)
    {
        $result = [];
        $username = $request->getParam('username');
        $email = $request->getParam('email');

        try {
            $result = $this->userFetcher->setForgotPassword($username, $email);
        } catch (\Exception $e) {
            $error = $e->getResponse()->getBody()->getContents();
            $error = json_decode($error, true);

            return $this->get('rest')->output($response, [
                'response_code' => $error['responseCode'],
                'message' => self::ERROR_CODE[$error['responseCode']]
            ]);
        }

        return $this->get('rest')->output($response, [
            'response_code' => 'INT033',
            'message' => self::ERROR_CODE['INT033']
        ]);
    }

    /**
     *
     */
    public function forgotUsername($request, $response)
    {
        $result = [];
        $email = $request->getParam('email');

        try {
            $result = $this->userFetcher->setForgotUsername($email);
        } catch (\Exception $e) {
            $error = $e->getResponse()->getBody()->getContents();
            $error = json_decode($error, true);

            return $this->rest->output($response, [
                'response_code' => $error['responseCode'],
                'message' => self::ERROR_CODE[$error['responseCode']]
            ]);
        }

        return $this->rest->output($response, [
            'response_code' => 'INT035',
            'message' => self::ERROR_CODE['INT035']
        ]);
    }
}
