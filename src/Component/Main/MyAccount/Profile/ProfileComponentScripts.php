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
            $container->get('receive_news'),
            $container->get('config_fetcher'),
            $container->get('token_parser'),
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($userFetcher, $playerSubscription, $configFetcher, $tokenParser, $playerSession)
    {
        $this->user = $userFetcher;
        $this->playerSubscription = $playerSubscription;
        $this->configFetcher = $configFetcher->withProduct('account');
        $this->tokenParser = $tokenParser;
        $this->playerSession = $playerSession;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        $myAccountConfigV2 = $this->configFetcher->getConfig('my_account_config.general_configuration');
        if ($myAccountConfigV2 && $myAccountConfigV2['enabled']) {
            $config = $myAccountConfigV2;
            $config['server_side_mapping'] = $config['server_side_validation'];
        } else {
            $smsConfig = $this->configFetcher->getConfigById('my_account_sms_verification');
            $messageConfig = $this->configFetcher->getConfigById('my_account_profile_server_side_mapping');
            $generalConfig = $this->configFetcher->getConfigById('my_account_profile_general_configuration');
            $modalConfig = $this->configFetcher->getConfigById('my_account_profile_modal_preview');
            $labelConfig = $this->configFetcher->getConfigById('my_account_profile_labels');
            $config = array_merge($smsConfig, $messageConfig, $generalConfig, $modalConfig, $labelConfig);
        }

        $fastRegUrlToken = $config['fastreg_mobile_redirect'] ?? '';
        $fastRegRedirect = $this->tokenParser->processTokens($fastRegUrlToken);

        $userDetail = $this->user->getPlayerDetails();
        $isFastReg = false;

        $fname = substr($userDetail['firstName'], 0, 5);
        $lname = substr($userDetail['lastName'], 0, 5);
        $bdate = $userDetail['dateOfBirth'];

        if (strtoupper($fname) == "DFRFN" ||
            strtoupper($lname) == "DFRLN" ||
            strtoupper($fname) == "DFRLN" ||
            strtoupper($lname) == "DFRFN" ||
            $bdate === "1/12/1900"
        ) {
            $isFastReg = true;
        }

        return [
            'user' => $this->getFormValues(),
            'verification_code_min_length_message' => $config['verification_code_min_length_message'],
            'verification_code_max_length_message' => $config['verification_code_max_length_message'],
            'verification_code_required_message' => $config['verification_code_required_message'],
            'messages' => Config::parse($config['server_side_mapping']) ?? '',
            'noUpdateDetected' => $config['no_changed_detected_message'] ?? '',
            'modalHeader' => $config['modal_preview_header'] ?? '',
            'modalTopBlurb' => $config['modal_preview_top_blurb'] ?? '',
            'modalCurrentLabel' => $config['modal_preview_current_label'] ?? '',
            'modalNewLabel' => $config['modal_preview_new_label'] ?? '',
            'modalBottomBlurb' => $config['modal_preview_bottom_blurb'] ?? '',
            'messageTimeout' => $config['message_timeout'] ?? 5,
            'contactPreferenceYes' => $config['contact_preference_yes_label'] ?? 'yes',
            'contactPreferenceNo' => $config['contact_preference_no_label'] ?? 'no',
            'fastRegRedirect' => $fastRegRedirect,
            'fastRegTimeout' => $config['fastreg_timeout_redirect'] ?? 4,
            'sessionToken' => $this->playerSession->getToken(),
            'isFastReg' => $isFastReg,
            'enableMobileAnnotation' => $config['enable_mobile_number_annotation'] ?? 0,
        ];
    }

    /**
     * Get Form Default values
     */
    private function getFormValues()
    {
        // initiate values config
        $apiValues = $this->user->getPlayerDetails();
        $receiveNews = $this->playerSubscription->isSubscribed();

        $mobile1Value = null;
        if (isset($apiValues['mobileNumbers']['Mobile 1'])) {
            $mobile1Value = $apiValues['mobileNumbers']['Mobile 1']['number'] ?? null;
        }

        return [
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
            'hidden_sms_2' => (($mobile1Value === '') || ($mobile1Value === null)),
            'mobile_number_1_masked' => $this->contactNumberMasking($apiValues['mobileNumbers']['Home']['number']),
            'mobile_number_2_masked' => (($mobile1Value === '') || ($mobile1Value === null)) ?
                '' : $this->contactNumberMasking($mobile1Value),
            'sms_1_verified' => $apiValues['mobileNumbers']['Home']['verified'] ?? null,
            'sms_2_verified' => $apiValues['mobileNumbers']['Mobile 1']['verified'] ?? null,
            'gender' => $apiValues['gender'],
            'address' => ($apiValues['address'] === '___') ? '' : $apiValues['address'],
            'city' => ($apiValues['city'] === '___') ? '' : $apiValues['city'],
            'postal_code' => $apiValues['postalCode'],
            'receive_news' => $receiveNews,
            'birthdate' => $apiValues['dateOfBirth']
        ];
    }

    /**
     * Contact number masking callback
     *
     * @param string $contact for email masking
     * @return string converted masking string
     */
    private function contactNumberMasking($contact)
    {
        return str_pad(substr($contact, -4), strlen($contact), '*', STR_PAD_LEFT);
    }
}
