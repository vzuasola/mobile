<?php

namespace App\MobileEntry\Component\Main\MyAccount;

/**
 *
 */
class MyAccountComponentController
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
        $username = $request->getParam('username');
        $email = $request->getParam('email');

        try {
            $this->userFetcher->setForgotPassword($username, $email);
            $status = 'FORGOT_PASSWORD_SUCCESS';
        } catch (\Exception $e) {
            $error = $e->getResponse()->getBody()->getContents();
            $error = json_decode($error, true);

            $status = 'INTERNAL_ERROR';
            if ($error['responseCode'] == "INT034") {
                $status = 'FORGOT_PASSWORD_FAILED';
            }
        }

        return $this->rest->output($response, [
            'status' => $status,
        ]);
    }
}
