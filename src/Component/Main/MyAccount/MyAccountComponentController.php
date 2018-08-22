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
     * User Fetcher Object
     */
    private $userFetcher;

    /**
     * Receive News Object
     */
    private $subscription;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('change_password'),
            $container->get('sms_verification'),
            $container->get('config_fetcher'),
            $container->get('user_fetcher'),
            $container->get('receive_news')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $changePassword, $sms, $configFetcher, $userFetcher, $receiveNews)
    {
        $this->rest = $rest;
        $this->changePassword = $changePassword;
        $this->sms = $sms;
        $this->configFetcher = $configFetcher->withProduct('account');
        $this->userFetcher = $userFetcher;
        $this->subscription = $receiveNews;
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
    public function sendverificationcode($request, $response)
    {
        $subTypeId = $request->getParsedBody()['data'] ?? null;

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

        return $this->rest->output($response, [
            'response_code' => $smsVerificationStatus,
            'message' => $message
        ]);
    }

    public function submitverificationcode($request, $response)
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

        return $this->rest->output($response, [
            'response_code' => $smsVerificationStatus,
            'message' => $message
        ]);
    }

    public function checksmsstatus($request, $response)
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

        return $this->rest->output($response, [
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

    /**
     * Ajax - update profile request
     */
    public function updateprofile($request, $response)
    {
        $defaultValues = $this->userFetcher->getPlayerDetails();
        $profileFormValues = $request->getParsedBody();
        $receiveNews = false;
        $mobile1 = null;

        $mobileNumber = $defaultValues['mobileNumbers']['Home']['number'] ?? "";
        $mobileNumberVerified = $defaultValues['mobileNumbers']['Home']['verified'] ?? false;

        if (isset($profileFormValues['mobile']) && !$mobileNumberVerified) {
            $mobileNumber = $profileFormValues['mobile'];
        }

        if (isset($profileFormValues['mobile1']) ?? $profileFormValues['mobile1']) {
            $mobile1 = $profileFormValues['mobile1'];
        }

        if (isset($profileFormValues['receive_news'])) {
            $receiveNews = true;
        }

        $playerDetails = [
            'username' => $defaultValues['username'],
            'firstname' => $defaultValues['firstName'],
            'lastname' => $defaultValues['lastName'],
            'email' => $defaultValues['email'],
            'countryid' => $defaultValues['countryId'],
            'gender' => $profileFormValues['gender'],
            'language' => $profileFormValues['language'],
            'mobile' => $mobileNumber,
            'mobile1' => $mobile1,
            'address' => $profileFormValues['address'],
            'city' => $profileFormValues['city'],
            'postalcode' => $profileFormValues['postal_code'],
        ];

        try {
            $this->userFetcher->setPlayerDetails($playerDetails);
            $this->subscription->setSubscription($receiveNews);
        } catch (\Exception $e) {
            $error = $e->getResponse()->getBody()->getContents();
            $error = json_decode($error, true);

            $status = 'server_error';
            if ($error['responseCode'] == "INT029") {
                $status = 'failed';
            }

            return $this->rest->output($response, [
                'success' => false,
                'status' => $status,
            ]);
        }

        return $this->rest->output($response, [
            'success' => true,
            'status' => 'success'
        ]);
    }
}
