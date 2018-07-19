<?php

namespace App\MobileEntry\Component\Main\CantLogin;

/**
 *
 */
class CantLoginComponentController
{
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
        $status = 'FORGOT_PASSWORD_SUCCESS';
        $username = $request->getParam('username');
        $email = $request->getParam('email');

        try {
            $this->userFetcher->setForgotPassword($username, $email);
        } catch (\Exception $e) {
            $error = $e->getResponse()->getBody()->getContents();
            $error = json_decode($error, true);

            $status = 'FORGOT_PASSWORD_FAILED';
            if ($error['responseCode'] == "INT001") {
                $status = 'INTERNAL_ERROR';
            }
        }

        return $this->rest->output($response, [
            'status' => $status,
        ]);
    }

    /**
     * Ajax - forgot username request
     */
    public function forgotusername($request, $response)
    {
        $status = 'FORGOT_USERNAME_SUCCESS';
        $email = $request->getParam('email');

        try {
            $this->userFetcher->setForgotUsername($email);
        } catch (\Exception $e) {
            $error = $e->getResponse()->getBody()->getContents();
            $error = json_decode($error, true);

            $status = 'FORGOT_USERNAME_FAILED';
            if ($error['responseCode'] == "INT001") {
                $status = 'INTERNAL_ERROR';
            }
        }

        return $this->rest->output($response, [
            'status' => $status,
        ]);
    }

    /**
     * Ajax - reset password request
     */
    public function resetforgottenpassword($request, $response)
    {
        $status = 'CHANGE_FORGOTTEN_PASSWORD_SUCCESS';
        $token = $request->getParam('token');
        $password = $request->getParam('password');

        try {
            $this->changePassword->setResetPassword($token, $password);
        } catch (\Exception $e) {
            $error = $e->getResponse()->getBody()->getContents();
            $error = json_decode($error, true);

            $status = 'CHANGE_FORGOTTEN_PASSWORD_FAILED';
            if ($error['responseCode'] == "INT001") {
                $status = 'INTERNAL_ERROR';
            }
        }

        return $this->rest->output($response, [
            'status' => $status,
        ]);
    }
}
