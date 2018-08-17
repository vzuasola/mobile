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
     * User Fetcher Object
     */
    private $userFetcher;

    /**
     * Receive News Object
     */
    private $receiveNews;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('change_password'),
            $container->get('user_fetcher'),
            $container->get('receive_news')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $changePassword, $userFetcher, $receiveNews)
    {
        $this->rest = $rest;
        $this->changePassword = $changePassword;
        $this->userFetcher = $userFetcher;
        $this->receiveNews = $receiveNews;
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
            $status = $this->userFetcher->setPlayerDetails($playerDetails);
            $this->receiveNews->setSubscription($receiveNews);
        } catch (\Exception $e) {
            return $response->withStatus(500);
        }

        return $this->rest->output($response, [
            'status' => 'UPDATE_PROFILE_SUCCESS'
        ]);
    }
}
