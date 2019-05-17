<?php

namespace App\MobileEntry\Form;

use App\Plugins\Form\FormInterface;
use App\Extensions\Form\ConfigurableForm\FormBase;
use App\Account\Mapping\LanguageMapping;

class MyProfileForm extends FormBase implements FormInterface
{

    protected $product = 'account';
    private $scripts;
    private $request;
    private $user;
    private $playerSubscription;
    private $disabledFields = [
        'username',
        'currency',
        'first_name',
        'last_name',
        'birthdate',
        'email',
        'country',
    ];

    private $locale = [
        'en-GB' => 'English (Europe)',
        'zh-TW' => 'Traditional Chinese (繁體)',
        'zh-CN' => 'Simplified Chinese (简体)',
        'en-US' => 'English',
        'el' => 'Greek (Ελληνικά)',
        'hi' => 'English (India)',
        'id' => 'Bahasa Indonesia',
        'ja' => 'Japanese (日本語)',
        'ko-KR' => 'Korean (한국어)',
        'pl' => 'Polish (Polski)',
        'th' => 'Thai (ภาษาไทย)',
        'vi' => 'Vietnamese (Tiếng Việt)',
    ];

    /**
     * Container dependency injection
     */
    public function setContainer($container)
    {
        parent::setContainer($container);
        $this->user = $container->get('user_fetcher');
        $this->request = $container->get('router_request');
        $this->config = $container->get('config_fetcher')->withProduct('account');

        $this->scripts = $container->get('scripts');
        $this->playerSubscription = $container->get('receive_news');
    }
    /**
     * @{inheritdoc}
     */
    public function getFormId()
    {
        return 'my_profile_form';
    }

    /**
     * @{inheritdoc}
     */
    public function alterFormDefinition($definition, $data, $options)
    {
        // call alter form attributes
        $definition = $this->alterFormAttributes($definition);

        // Radios Gender Field
        $choice = $definition['gender']['options']['choices'];
        unset($definition['gender']['options']['choices']);
        $choices = $this->pipeToChoices($choice);
        $definition['gender']['options']['choices'] = $choices;
        $definition['gender']['options']['data'] = reset($choices);

        // checkboxes primary number Field
        $choice = $definition['primary_number']['options']['choices'];
        unset($definition['primary_number']['options']['choices']);
        $choices = $this->pipeToChoices($choice);
        $definition['primary_number']['options']['choices'] = $choices;
        $definition['primary_number']['options']['data'] = (array) $choices;
        // Disable primary number field checkbox
        $definition['primary_number']['options']['disabled'] = true;

        // Select Language Field
        $choice = $definition['language']['options']['choices'];
        unset($definition['language']['options']['choices']);
        $choices = $this->pipeToChoices($choice);
        $definition['language']['options']['choices'] = $choices;
        $definition['language']['options']['placeholder'] = false;

        $definition = $this->setFormDefinitionValues($definition);
        $definition = $this->setDisabledFields($definition);

        if (isset($definition['mobile_number_1']['options']['country_area_code_validation'])) {
            $mobileNumberValidation = $definition['mobile_number_1']['options']['country_area_code_validation'];
            $definition['mobile_number_1']['options']['attr']['area_code_validation'] = $mobileNumberValidation;
        }

        $definition['submit']['options']['attr']['class'] = "btn btn-small btn-yellow btn-update btn-lower-case";
        $definition['button_cancel']['options']['attr']['class'] = "btn btn-small btn-gray btn-cancel btn-lower-case";
        return $definition;
    }

    /**
     * @{inheritdoc}
     */
    public function submit($form, $options)
    {
        return false;
    }

    /**
     * Helper function to set form values
     *
     * @param  array $definition form definition
     *
     * @return array $definition updated form definition
     */
    private function setFormDefinitionValues($definition)
    {
        $values = $this->getFormValues($definition);
        $countryCode = $this->countryCodeMapping();
        // if mobile number 2 is prepopulated make it required
        if ($values['mobile_number_2'] &&
            isset($definition['mobile_number_1']['validators']['rules']['callback_required'])) {
            $requiredMobileNumber1 = $definition['mobile_number_1']['validators']['rules']['callback_required'];
            $definition['mobile_number_2']['validators']['rules']['callback_required'] = $requiredMobileNumber1;
            $reversedArray = array_reverse($definition['mobile_number_2']['validators']['rules']);
            $definition['mobile_number_2']['validators']['rules']  = $reversedArray;
        }
        // iterate and put all values to field
        foreach ($values as $key => $value) {
            if (isset($definition[$key])) {
                $definition[$key]['options']['attr']['value'] = $value;
                $definition[$key]['options']['data'] = $value;
            }
        }
        // if there's no value for mobile number 2 put the country code as a default value
        if (!$values['mobile_number_2']) {
            $definition['mobile_number_2']['options']['attr']['data-value'] = $countryCode;
        }
        // check mobile 1 if verified and set the flag to true and disable field
        if ($values['sms_1_verified']) {
            $definition['mobile_number_1']['options']['attr']['data-verified'] = "1";
            $this->disabledFields = array_merge($this->disabledFields, ['mobile_number_1']);
        }
        // check mobile 2 if verified and set the flag to true (will not disable field still can edit)
        if ($values['sms_2_verified']) {
            $definition['mobile_number_2']['options']['attr']['data-verified'] = "1";
        }

        return $definition;
    }

    /**
     * Helper function to alter form attributes
     *
     * @param  array $definition form definition
     *
     * @return array $definition updated form definition
     */
    private function alterFormAttributes($definition)
    {
        // logic to get custom attributes that will be attach to the field
        foreach ($definition as $key => $formField) {
            if (isset($definition[$key]['options']['placeholder']) &&
                (strpos($formField['type'], 'TextType') !== false ||
                strpos($formField['type'], 'TextAreaType') !== false)
            ) {
                $this->moveAttribute($definition, $key, 'annotation', 'data-annotation');
                $definition[$key]['options']['attr']['placeholder'] = $definition[$key]['options']['placeholder'];
                $definition[$key]['options']['attr']['autocomplete'] = "off";
                unset($definition[$key]['options']['placeholder']);
            }
        }

        // set date-format custom attribute
        if (isset($definition['birthdate']['options']['date-format'])) {
            $dateFormat = $definition['birthdate']['options']['date-format'];
            $definition['birthdate']['options']['attr']['date-format'] = $dateFormat;
            unset($definition['birthdate']['options']['date-format']);
        }

        // set mobile number custom attribute
        if (isset($definition['mobile_number_1']['options']['tooltip-content'])) {
            $tooltip = $definition['mobile_number_1']['options']['tooltip-content'];
            $definition['mobile_number_1']['options']['attr']['tooltip-content'] = $tooltip;
            unset($definition['mobile_number_1']['options']['tooltip-content']);
        }

        return $definition;
    }


    /**
     * Email masking callback
     *
     * @param string $email for email masking
     * @return string converted masking string
     */
    private function obfuscateEmail($email)
    {
        $charShown = 2;
        $mailParts = explode("@", $email);
        $username = $mailParts[0];
        $len = strlen($username);

        if ($len <= $charShown) {
            return implode("@", $mailParts);
        }

        //Logic: show asterisk in middle, but also show the last character before @
        $mailParts[0] = substr($username, 0, $charShown)
            . str_repeat("*", 8)
            . substr($username, $len - $charShown + 2, 1);

        return implode("@", $mailParts);
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

    /**
     * Country Mapping
     */
    private function countryCodeMapping()
    {
        $serverParams = $this->request->getServerParams();
        $serverGeoipCountry = $serverParams['HTTP_X_CUSTOM_LB_GEOIP_COUNTRY'] ?? null;
        $mapping = $this->config->getConfigById('my_account_profile_country_code_mapping');
        $mappingCodeList = $mapping['country_code_mapping'];
        $countryCodeMapping = explode(PHP_EOL, $mappingCodeList);
        $countryCodeMappingList = array();

        foreach ($countryCodeMapping as $value) {
            list($newKey, $newValue) = explode('|', rtrim($value));
            $countryCodeMappingList[$newKey] = $newValue;
        }

        return $countryCodeMappingList[$serverGeoipCountry] ?? '+63';
    }

    /**
     * Get Form Default values
     */
    private function getFormValues($definition)
    {
        // initiate values config
        $apiValues = $this->user->getPlayerDetails();
        $dateFormat = $definition['birthdate']['options']['attr']['date-format'];
        $receiveNews = $this->playerSubscription->isSubscribed();
        $apiValues['email'] = $this->obfuscateEmail($apiValues['email']);

        if (isset($apiValues['Is-Mid']) && $apiValues['Is-Mid'] == "off") {
            $apiValues['email'] = "********";
            $apiValues['mobileNumbers']['Home']['number'] = "********";
        }

        $mobile1Value = null;
        if (isset($apiValues['mobileNumbers']['Mobile 1'])) {
            if (isset($apiValues['Is-Mid']) && $apiValues['Is-Mid'] == "off") {
                $apiValues['mobileNumbers']['Mobile 1']['number'] = "********";
            }
            $mobile1Value = $apiValues['mobileNumbers']['Mobile 1']['number'] ?? null;
        }

        $countryCode = $this->countryCodeMapping();
        $fastRegMobileValue = $countryCode . "000000";
        $mobileNumber1 = $apiValues['mobileNumbers']['Home']['number'];
        if ($fastRegMobileValue == $apiValues['mobileNumbers']['Home']['number']) {
            $mobileNumber1 = $countryCode;
        }

        $result = [
            'username' => $apiValues['username'],
            'currency' => $apiValues['currency'],
            'first_name' => $apiValues['firstName'],
            'last_name' => $apiValues['lastName'],
            'birthdate' => date($dateFormat ?? 'Y/m/d', $apiValues['dateOfBirth']),
            'gender' => $apiValues['gender'],
            'language' => $apiValues['locale'],
            'country' => $apiValues['countryName'],
            'countryId' => $apiValues['countryId'],
            'email' => $apiValues['email'],
            'mobile_number_1' => $mobileNumber1,
            'mobile_number_2' => (($mobile1Value === '') || ($mobile1Value === null)) ? '' : $mobile1Value,
            'language_field' => $this->locale,
            'sms_1_verified' => $apiValues['mobileNumbers']['Home']['verified'] ?? null,
            'sms_2_verified' => $apiValues['mobileNumbers']['Mobile 1']['verified'] ?? null,
            'gender' => $apiValues['gender'],
            'address' => ($apiValues['address'] === '___') ? '' : $apiValues['address'],
            'city' => ($apiValues['city'] === '___') ? '' : $apiValues['city'],
            'postal_code' => $apiValues['postalCode'],
            'receive_news' => $receiveNews,
        ];

        $result['mobile_number_1'] = $this->contactNumberMasking($result['mobile_number_1']);
        $result['mobile_number_2'] = $this->contactNumberMasking($result['mobile_number_2']);

        return $result;
    }

    /**
     * Set Disabled fields
     */
    private function setDisabledFields($definition)
    {
        $definition['submit']['options']['attr']['data-redirect'] = 0;

        foreach ($this->disabledFields as $field) {
            // dd(var_dump($definition[$field]['options']['attr']));
            $dummyName = substr($definition[$field]['options']['attr']['value'], 0, 5);
            // $inputName = $definition[$field]['options']['attr']['name'];
            $bdate = $definition[$field]['options']['attr']['value'];

            if (strtoupper($dummyName) == 'DFRFN' ||
                strtoupper($dummyName) == 'DFRLN' 
                // $inputName == 'MyProfileForm[birthdate]' || 
                ){ 
                // ||
                // $bdate === "01/12/1925"){
                $definition[$field]['options']['attr']['value'] = "";

                if ($this->request->getQueryParam("pmid")) {
                    $definition['submit']['options']['attr']['data-redirect'] = 1;
                }


            
            } elseif($bdate == '01/12/1925'){

            }
            
            else {
                $definition[$field]['options']['attr']['disabled'] = "disabled";
            }
        }

        return $definition;
    }
}
