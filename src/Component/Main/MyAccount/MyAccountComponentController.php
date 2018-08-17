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
     * Change Password Fetcher Object.
     */
    private $changePassword;

    /**
     * sms Object
     */
    private $sms;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('change_password'),
            $container->get('sms_verification'),
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $changePassword, $sms, $configFetcher)
    {
        $this->rest = $rest;
        $this->changePassword = $changePassword;
        $this->sms = $sms;
        $this->configFetcher = $configFetcher->withProduct('account');
    }

    /**
     * Ajax - change password request
     */
    public function changepassword($request, $response)
    {
        $currentPassword = $request->getParam('current_password');
        $newPassword = $request->getParam('new_password');

        try {
            $this->changePassword->changePlayerPassword($currentPassword, $newPassword);
            $status = 'CHANGE_PASSWORD_SUCCESS';
        } catch (\Exception $e) {
            $error = $e->getResponse()->getBody()->getContents();
            $error = json_decode($error, true);

            $status = 'INTERNAL_ERROR';
            if ($error['responseCode'] == "INT013") {
                $status = 'CHANGE_PASSWORD_FAILED';
            }
        }

        return $this->rest->output($response, [
            'status' => $status,
        ]);
    }

        /**
     * Send Verification Code
     */
    public function sendVerificationCode($request, $response, $args)
    {
        $subTypeId = $request->getParsedBody()['subtypeId'] ?? null;

        try {
            $smsVerificationStatus = $this->sms->sendSmsVerificationCode($subTypeId);
        } catch (\Exception $e) {
            return $response->withStatus(500);
        }

        $smsVerificationErrorMessageList = $this->getErrorMessage();

        if ($smsVerificationStatus) {
            switch ($smsVerificationStatus) {
                case 'INT019':
                    $smsVerificationStatus = 'SMS_VERIFICATION_SUCCESS';
                    break;
                case 'INT020':
                    $smsVerificationStatus = 'SMS_VERIFICATION_FAILED';
                    break;
                case 'INT001':
                    $smsVerificationStatus = 'INTERNAL_ERROR';
                    break;
                default:
                    $smsVerificationStatus = '';
            }
        }

        foreach ($smsVerificationErrorMessageList as $key => $value) {
            if ($key == $smsVerificationStatus) {
                $message = $value[0];
            }
        }

        return $this->get('rest')->output($response, [
            'response_code' => $smsVerificationStatus,
            'message' => $message
        ]);
    }

    public function submitVerificationCode($request, $response, $args)
    {

        $data = $request->getParsedBody()['data'] ?? null;

        try {
            $smsVerificationStatus = $this->sms->submitSmsVerificationCode($data);
        } catch (\Exception $e) {
            return $response->withStatus(500);
        }

        $smsVerificationErrorMessageList = $this->getErrorMessage();

        if ($smsVerificationStatus) {
            switch ($smsVerificationStatus) {
                case 'INT021':
                    $smsVerificationStatus = 'SMS_VERIFICATION_SUBMIT_SUCCESS';
                    break;
                case 'INT022':
                    $smsVerificationStatus = 'SMS_VERIFICATION_SUBMIT_FAILED';
                    break;
                case 'INT001':
                    $smsVerificationStatus = 'INTERNAL_ERROR';
                    break;
                default:
                    $smsVerificationStatus = '';
            }
        }

        foreach ($smsVerificationErrorMessageList as $key => $value) {
            if ($key == $smsVerificationStatus) {
                $message = $value[0];
            }
        }

        return $this->get('rest')->output($response, [
            'response_code' => $smsVerificationStatus,
            'message' => $message
        ]);
    }

    public function checkSmsStatus($request, $response, $args)
    {
        $subTypeId = $request->getParsedBody()['subtypeId'] ?? null;
        try {
            $smsStatus = $this->sms->checkSmsStatus($subTypeId);
        } catch (\Exception $e) {
            return $response->withStatus(500);
        }

        $smsVerificationErrorMessageList = $this->getErrorMessage();

        if ($smsStatus) {
            switch ($smsStatus) {
                case 'INT023':
                    $smsStatus = 'CHECK_SMS_STATUS_VERIFIED';
                    break;
                case 'INT024':
                    $smsStatus = 'CHECK_SMS_STATUS_NOT_VERIFIED';
                    break;
                case 'INT025':
                    $smsStatus = 'CHECK_SMS_STATUS_FAILED';
                    break;
                case 'INT001':
                    $smsStatus = 'INTERNAL_ERROR';
                    break;
                default:
                    $smsStatus = '';
            }
        }

        foreach ($smsVerificationErrorMessageList as $key => $value) {
            if ($key == $smsStatus) {
                $message = $value[0];
            }
        }

        return $this->get('rest')->output($response, [
            'response_code' => $smsStatus,
            'message' => $message
        ]);
    }

    /**
     * Error Message List fetcher from drupal
     */
    private function getErrorMessage()
    {
        $smsVerification = $this->configFetcher->getConfigById('my_account_sms_verification');
        $smsVerificationErrorMessage = $smsVerification['verification_code_response'];

        $smsVerificationErrorMessages = explode(PHP_EOL, $smsVerificationErrorMessage);
        $smsVerificationErrorMessageList = array();

        foreach ($smsVerificationErrorMessages as $value) {
            list($newKey, $newValue) = explode('|', rtrim($value));
            $smsVerificationErrorMessageList[$newKey] = explode(PHP_EOL, $newValue);
        }

        return $smsVerificationErrorMessageList;
    }
}
