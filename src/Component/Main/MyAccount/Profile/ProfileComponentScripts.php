<?php

namespace App\MobileEntry\Component\Main\MyAccount\Profile;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\Drupal\Config;

/**
 *
 */
class ProfileComponentScripts implements ComponentAttachmentInterface
{
    /**
     * User Manager Object.
     */
    private $user;

    /**
     * Player Subscription Manager Object.
     */
    private $playerSubscription;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('user_fetcher'),
            $container->get('receive_news')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($userFetcher, $playerSubscription)
    {
        $this->user = $userFetcher;
        $this->playerSubscription = $playerSubscription;
    }
    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        return [
            'user' => $this->getFormValues($this->user->getPlayerDetails())
        ];
    }

    /**
     * Get Form Default values
     */
    private function getFormValues($values)
    {
        // initiate values config
        $apiValues = $this->user->getPlayerDetails();
        $receiveNews = $this->playerSubscription->isSubscribed();

        $mobile1Value = null;
        if (isset($apiValues['mobileNumbers']['Mobile 1'])) {
            $mobile1Value = $apiValues['mobileNumbers']['Mobile 1']['number'] ?? null;
        }

        $result = [
            'username' => $apiValues['username'],
            'currency' => $apiValues['currency'],
            'first_name' => $apiValues['firstName'],
            'last_name' => $apiValues['lastName'],
            'gender' => $apiValues['gender'],
            'language' => $apiValues['locale'],
            'country' => $apiValues['countryName'],
            'countryId' => $apiValues['countryId'],
            'mobile_number_1' => $apiValues['mobileNumbers']['Home']['number'],
            'mobile_number_2' => (($mobile1Value === '') || ($mobile1Value === null)) ? '' : $mobile1Value,
            'sms_1_verified' => $apiValues['mobileNumbers']['Home']['verified'] ?? null,
            'sms_2_verified' => $apiValues['mobileNumbers']['Mobile 1']['verified'] ?? null,
            'gender' => $apiValues['gender'],
            'address' => ($apiValues['address'] === '___') ? '' : $apiValues['address'],
            'city' => ($apiValues['city'] === '___') ? '' : $apiValues['city'],
            'postal_code' => $apiValues['postalCode'],
            'receive_news' => $receiveNews,
        ];

        return $result;
    }
}
