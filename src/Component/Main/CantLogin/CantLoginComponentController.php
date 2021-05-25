<?php

namespace App\MobileEntry\Component\Main\CantLogin;

use App\Cookies\Cookies;
use App\Utils\Host;
use App\Fetcher\Integration\Exception\ServerDownException;

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
     * Config Fetcher Object.
     */
    private $configFetcher;

    /**
     * Rate Limit
     */
    private $rateLimit;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('user_fetcher'),
            $container->get('change_password'),
            $container->get('rate_limit'),
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $userFetcher, $changePassword, $rate_limit, $config_fetcher)
    {
        $this->rest = $rest;
        $this->userFetcher = $userFetcher;
        $this->changePassword = $changePassword;
        $this->rateLimit = $rate_limit;
        $this->configFetcher = $config_fetcher->withProduct('account');
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
        } catch (ServerDownException $e) {
            $status = 'ERROR_MID_DOWN';
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

    /**
     * Ajax - forgot username request
     */
    public function forgotusername($request, $response)
    {
        $config = $this->configFetcher->getConfigById('rate_limit');
        $interval = $config['rate_limit_username_interval'] ?? 60;
        $operation = $config['rate_limit_username_operation'] ?? 1;

        $isLimitExceeded = $this->rateLimit->checkLimit("forgotusername", $operation, $interval);

        if ($isLimitExceeded) {
            return $this->rest->output($response, [
                'status' => 'SUCCESS1',
            ]);
        }

        $email = $request->getParam('email');

        try {
            $this->userFetcher->setForgotUsername($email);
            $status = 'FORGOT_USERNAME_SUCCESS';
        } catch (ServerDownException $e) {
            $status = 'ERROR_MID_DOWN';
        } catch (\Exception $e) {
            $error = $e->getResponse()->getBody()->getContents();
            $error = json_decode($error, true);

            $status = 'INTERNAL_ERROR';
            if ($error['responseCode'] == "INT036") {
                $status = 'FORGOT_USERNAME_FAILED';
            }
        }

        // Always retrun success
        return $this->rest->output($response, [
            'status' => 'SUCCESS',
        ]);
    }

    /**
     * Ajax - reset password request
     */
    public function resetforgottenpassword($request, $response)
    {
        $token = $request->getParam('token');
        $password = $request->getParam('password');

        try {
            $this->changePassword->setResetPassword($token, $password);
            $status = 'CHANGE_FORGOTTEN_PASSWORD_SUCCESS';

            $options = [
                'path' => '/',
                'domain' => Host::getDomain(),
                'expire' => 0,
            ];

            Cookies::set('reset_token', $token, $options);
        } catch (\Exception $e) {
            $error = $e->getResponse()->getBody()->getContents();
            $error = json_decode($error, true);

            $status = 'INTERNAL_ERROR';
            if ($error['responseCode'] == "INT038") {
                $status = 'CHANGE_FORGOTTEN_PASSWORD_FAILED';
            }
        }

        return $this->rest->output($response, [
            'status' => $status,
        ]);
    }
}
