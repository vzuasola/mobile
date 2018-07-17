<?php

namespace App\MobileEntry\Component\Main\CantLogin;

/**
 *
 */
class CantLoginComponentController
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

    /**
     * Rest Object.
     */
    private $rest;

    /**
     * User Fetcher Object.
     */
    private $userFetcher;

    /**
     * Change Password Fetcher Object.
     */
    private $changePassword;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('user_fetcher'),
            $container->get('change_password')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $userFetcher, $changePassword)
    {
        $this->rest = $rest;
        $this->userFetcher = $userFetcher;
        $this->changePassword = $changePassword;
    }

    /**
     * Ajax - forgot password request
     */
    public function forgotpassword($request, $response)
    {
        $result = [];
        $username = $request->getParam('username');
        $email = $request->getParam('email');

        try {
            $result = $this->userFetcher->setForgotPassword($username, $email);
        } catch (\Exception $e) {
            $error = $e->getResponse()->getBody()->getContents();
            $error = json_decode($error, true);

            return $this->rest->output($response, [
                'response_code' => $error['responseCode'],
                'message' => self::ERROR_CODE[$error['responseCode']]
            ]);
        }

        return $this->rest->output($response, [
            'response_code' => 'INT033',
            'message' => self::ERROR_CODE['INT033']
        ]);
    }

    /**
     * Ajax - forgot username request
     */
    public function forgotusername($request, $response)
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

    /**
     * Ajax - reset password request
     */
    public function resetforgottenpassword($request, $response)
    {
        $result = [];

        $token = $request->getParam('token');
        $password = $request->getParam('password');

        try {
            $result = $this->changePassword->setResetPassword($token, $password);
        } catch (\Exception $e) {
            $error = $e->getResponse()->getBody()->getContents();
            $error = json_decode($error, true);

            return $this->rest->output($response, [
                'response_code' => $error['responseCode'],
                'message' => self::ERROR_CODE[$error['responseCode']]
            ]);
        }

        return $this->rest->output($response, [
            'response_code' => 'INT037',
            'message' => self::ERROR_CODE['INT037']
        ]);
    }
}
