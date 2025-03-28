<?php

namespace App\MobileEntry\Component\Main\MyAccount;

use App\RateLimiter\PredisRateLimiter;
use App\RateLimiter\PredisLimiterRate;
use App\RateLimiter\PredisLimiterMode;
use App\Player\Player;
use App\Fetcher\Integration\Exception\ServerDownException;

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
     * Receive News Object.
     */
    private $subscription;

    /**
     * Player Session Object.
     */
    private $playerSession;

    /**
     * Session Object.
     */
    private $session;

    /**
     * @var PredisRateLimiter
     */
    private $rateLimiter;

    /**
     * @var SMSBlocker
     */
    private $smsBlocker;

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
            $container->get('receive_news'),
            $container->get('player_session'),
            $container->get('session'),
            $container->get('predis_rate_limiter'),
            $container->get('sms_blocker')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $rest,
        $changePass,
        $sms,
        $configFetcher,
        $userFetcher,
        $receiveNews,
        $playerSession,
        $session,
        $rateLimiter,
        $smsBlocker
    ) {
        $this->rest = $rest;
        $this->changePassword = $changePass;
        $this->sms = $sms;
        $this->configFetcher = $configFetcher->withProduct('account');
        $this->userFetcher = $userFetcher;
        $this->subscription = $receiveNews;
        $this->playerSession = $playerSession;
        $this->session = $session;
        $this->rateLimiter = $rateLimiter;
        $this->smsBlocker = $smsBlocker;
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
        $userMobileNumberIndex = $request->getParsedBody()['data'] ?? null;
        // Check for SMS Blocker
        if ($userMobileNumberIndex && $this->smsBlocker->isBlockedByCountry($userMobileNumberIndex)) {
            return $this->rest->output($response, [
                'response_code' => 'ERROR',
                'message' => $this->smsBlocker->getErrorMessage(),
            ]);
        }

        $config = $this->configFetcher->getConfigById('rate_limit');
        $type = $config['rate_limit_sms_type'] ?? PredisLimiterMode::USER_MODE;
        $interval = $config['rate_limit_sms_interval'] ?? 60;
        $operation = $config['rate_limit_sms_operation'] ?? 1;

        $mode = PredisLimiterMode::createPredisLimiterModeByType($type);
        $rate = new PredisLimiterRate($interval, $operation);
        $isLimitExceeded = $this->rateLimiter->shouldLimit('sms_verification', $mode, $rate, $userMobileNumberIndex);

        if ($isLimitExceeded) {
            return $this->rest->output($response, [
                'response_code' => 'SUCCESS1',
                'message' => $config['rate_limit_sms_error_message']
                    ?? 'You have exceeded the limit of sending verification code.',
            ]);
        }

        try {
            $smsVerificationStatus = $this->sms->sendSmsVerificationCode($userMobileNumberIndex);
        } catch (ServerDownException $e) {
            $status = 'ERROR_MID_DOWN';
            $myAccountConfigV2 = $this->configFetcher->getConfig('my_account_config.general_configuration');
            if ($myAccountConfigV2 && $myAccountConfigV2['enabled']) {
                $config = $myAccountConfigV2;
            } else {
                $config = $this->configFetcher->getConfigById('my_account_header');
            }

            return $this->rest->output($response, [
                'response_code' => $status,
                'message' => $config['error_mid_down'] ?? "",
            ]);
        } catch (\Exception $e) {
            return $response->withStatus(500);
        }

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

        $message = $this->getErrorMessage($smsVerificationStatus);

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

        $message = $this->getErrorMessage($smsVerificationStatus);

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
                    break;
            }
        }

        $message = $this->getErrorMessage($smsStatus);

        return $this->rest->output($response, [
            'response_code' => $smsStatus,
            'message' => $message
        ]);
    }

    /**
     * Error Message List fetcher from drupal
     */
    private function getErrorMessage($status)
    {
        $myAccountConfigV2 = $this->configFetcher->getConfig('my_account_config.general_configuration');
        if ($myAccountConfigV2 && $myAccountConfigV2['enabled']) {
            $smsVerification = $myAccountConfigV2;
        } else {
            $smsVerification = $this->configFetcher->getConfigById('my_account_sms_verification');
        }
        $smsVerificationErrorMessage = $smsVerification['verification_code_response'];
        $smsVerificationErrorMessages = explode(PHP_EOL, $smsVerificationErrorMessage);
        $smsVerificationErrorMessageList = array();

        foreach ($smsVerificationErrorMessages as $value) {
            list($newKey, $newValue) = explode('|', rtrim($value));
            $smsVerificationErrorMessageList[$newKey] = explode(PHP_EOL, $newValue);
        }

        foreach ($smsVerificationErrorMessageList as $key => $value) {
            if ($key == $status) {
                $message = $value[0];
            }
        }

        return $message;
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

        if (isset($profileFormValues['mobile']) &&
            !$mobileNumberVerified &&
            strpos($profileFormValues['mobile'], "*") === false) {
            $mobileNumber = $profileFormValues['mobile'];
        }

        if ((isset($profileFormValues['mobile1']) ?? $profileFormValues['mobile1'])) {
            $mobile1 = $profileFormValues['mobile1'];
            if (strpos($profileFormValues['mobile1'], "*") !== false) {
                $mobile1 = $defaultValues['mobileNumbers']['Mobile 1']['number'] ?? "";
            }
        }

        if ($profileFormValues['receive_news'] === 'true') {
            $receiveNews = true;
        }

        $playerDetails = [
            'username' => $defaultValues['username'],
            'firstname' => $profileFormValues['firstName'],
            'lastname' => $profileFormValues['lastName'],
            'birthdate' => "/Date(" . $profileFormValues['birthdate'] . ")/",
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

        $this->session->delete(Player::CACHE_KEY);

        return $this->rest->output($response, [
            'success' => true,
            'status' => 'success'
        ]);
    }

    /**
     * Ajax - verify password request
     */
    public function verifypassword($request, $response)
    {
        $requestBody = $request->getParsedBody();
        $playerDetails = $this->userFetcher->getPlayerDetails();
        $password = $requestBody['password'] ?? null;
        $username = $playerDetails['username'];
        $success = false;
        $status = "failed";

        if ($this->playerSession->isLogin()) {
            try {
                $this->playerSession->validateSessionPassword($username, $password);
                $success = true;
                $status = 'success';
            } catch (ServerDownException $e) {
                $status = 'ERROR_MID_DOWN';
            } catch (\Exception $e) {
                $error = $e->getResponse()->getBody()->getContents();
                $error = json_decode($error, true);
                $status = 'server_error';
                if ($error['responseCode'] == "INT027") {
                    $status = 'failed';
                }
            }
        }

        return $this->rest->output($response, [
            'success' => $success,
            'status' => $status
        ]);
    }

    /**
     * Ajax - validatebonuscode
     */
    public function validatebonuscode($request, $response)
    {
        $config = $this->configFetcher->getConfigById('rate_limit');
        $rateLimitEnabled = $config['rate_limit_bonus_code_enable'] ?? 0;

        if ($rateLimitEnabled) {
            $interval = $config['rate_limit_bonus_code_interval'] ?? 60;
            $operation = $config['rate_limit_bonus_code_operation'] ?? 1;
            $type = $config['rate_limit_bonus_code_type'] ?? PredisLimiterMode::USER_MODE;

            $mode = PredisLimiterMode::createPredisLimiterModeByType($type);
            $rate = new PredisLimiterRate($interval, $operation);
            $isLimitExceeded = $this->rateLimiter->shouldLimit('bonus_code', $mode, $rate);

            if ($isLimitExceeded) {
                $data = [
                    "statusCode" => 'RATELIMIT'
                ];
                return $this->rest->output($response, [
                    'data' => $data,
                ]);
            }
        }

        $bonusCode = $request->getParam('bonus_code');

        try {
            $result = $this->userFetcher->validateCouponCode($bonusCode);

            $data = [
                "data" => $result
            ];
        } catch (\Exception $e) {
            $data = [
                "data" => $result
            ];
        }

        return $this->rest->output($response, $data);
    }

    /**
     * Ajax - claimbonuscode
     */
    public function claimbonuscode($request, $response)
    {
        $bonusCode = $request->getParam('bonus_code');
        $bonusType = $request->getParam('bonus_type');

        try {
            if ($bonusType == "BonusPromoCode") {
                $this->userFetcher->setRedeemCoupon($bonusCode);
            } else {
                $this->userFetcher->addCouponExtenal($bonusCode);
            }
            $status = 'CLAIM_BONUS_SUCCESS';
        } catch (\Exception $e) {
            $status = 'CLAIM_BONUS_FAILED';
        }

        return $this->rest->output($response, [
            'status' => $status,
        ]);
    }
}
