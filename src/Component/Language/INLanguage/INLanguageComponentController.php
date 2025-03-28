<?php

namespace App\MobileEntry\Component\Language\INLanguage;

use App\Player\Player;

class INLanguageComponentController
{
    const INDIA_LANGUAGES = [
        'en-us' => 'en',
        'en-gb' => 'eu',
        'zh-tw' => 'sc',
        'zh-cn' => 'ch',
        'th' => 'th',
        'vi' => 'vn',
        'id' => 'id',
        'ja' => 'jp',
        'ko-kr' => 'kr',
        'en-in' => 'in',
        'te' => 'te',
        'hi' => 'hi',
        'ru' => 'en',
        'el' => 'gr',
        'pl' => 'pl',
        'af' => 'en'
    ];

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    private $rest;

    private $playerSession;

    private $language;

    private $user;

    private $session;

    private $preferences;

    private $ip;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('rest'),
            $container->get('player_session'),
            $container->get('language_fetcher'),
            $container->get('user_fetcher'),
            $container->get('session'),
            $container->get('preferences_fetcher'),
            $container->get('id_domain')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $configs,
        $rest,
        $playerSession,
        $language,
        $user,
        $session,
        $preferences,
        $ip
    ) {
        $this->configs = $configs;
        $this->rest = $rest;
        $this->playerSession = $playerSession;
        $this->language = $language;
        $this->user = $user;
        $this->session = $session;
        $this->preferences = $preferences;
        $this->ip = $ip;
    }


    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function language($request, $response)
    {
        $data = [];
        $langData = [];

        try {
            $entrypageConfigs = $this->configs->getConfig('mobile_entrypage.entrypage_configuration');
        } catch (\Exception $e) {
            $entrypageConfigs = [];
        }

        $data['mobile_language_svg_class'] = $entrypageConfigs['mobile_language_svg_class'] ?? 'in-language';
        $data['mobile_india_language_select'] = $entrypageConfigs['mobile_language_select'] ?? 'Select your Language';
        $data['mobile_india_language_description'] = $entrypageConfigs['mobile_language_description_select'] ?? '';

        if (isset($entrypageConfigs['mobile_language_code'])) {
            // prepare Form Data
            $row = explode(PHP_EOL, $entrypageConfigs['mobile_language_code']);
            foreach ($row as $rows) {
                $lang = explode('|', trim($rows));

                list($dataLang, $dataLangPrefix, $language) = $lang;
                $langData[] = [
                    'icoreLang' => $dataLang,
                    'langPrefix' => $dataLangPrefix,
                    'langText' => $language
                ];
            }
            $data['langData'] = $langData;
        }

        return $this->rest->output($response, $data);
    }

    public function details($request, $response)
    {
        $data = [];

        try {
            $iCoreLang = strtolower($this->playerSession->getDetails()['locale']);
            $data['country'] = $this->ip->getGeoIpCountry();
            $data['language'] = $this::INDIA_LANGUAGES[$iCoreLang] ?? 'en';
        } catch (\Exception $e) {
            $data = [];
        }

        return $this->rest->output($response, $data);
    }

    public function update($request, $response)
    {
        try {
            $data = [];
            $requestData = $request->getParsedBody();
            $defaultValues = $this->playerSession->getDetails();
            $lang = $requestData['language'];

            $playerDetails = [
                'username' => $defaultValues['username'],
                'firstname' => $defaultValues['firstName'],
                'lastname' => $defaultValues['lastName'],
                'birthdate' => "/Date(" . $defaultValues['dateOfBirth'] . ")/",
                'email' => $defaultValues['email'],
                'countryid' => $defaultValues['countryId'],
                'gender' => $defaultValues['gender'],
                'language' => $lang,
                'mobile' => $defaultValues['mobileNumbers']['Home']['number'] ?? "",
                'mobile1' => $defaultValues['mobileNumbers']['Mobile 1']['number'] ?? "",
                'address' => $defaultValues['address'],
                'city' => $defaultValues['city'],
                'postalcode' => $defaultValues['postalCode'],
            ];

            $res = $this->user->setPlayerDetails($playerDetails);

            $status = 'success';
            if ($res === "INT029") {
                $status = "failed";
            }

            if ($status === 'success') {
                $this->session->delete(Player::CACHE_KEY);
            }

            $data['status'] = $status;
        } catch (\Exception $e) {
            $data['status'] = "failed";
        }

        return $this->rest->output($response, $data);
    }

    public function checkpreference($request, $response)
    {
        $data = [];
        try {
            $data['inModal'] = false;
            if ($this->playerSession->isLogin()) {
                $data['pref'] = $this->preferences->getPreferences();
                $data['inModal'] = $this->preferences->getPreferences()['dafabet.language.popup.geoip'] ?? true;
            }
        } catch (\Exception $e) {
            $data['inModal'] = false;
        }

        return $this->rest->output($response, $data);
    }

    public function preference($request, $response)
    {
        try {
            $res = $this->preferences->savePreference('dafabet.language.popup.geoip', false);
            $data['status'] = 'success';
        } catch (\Exception $e) {
            $data['status'] = 'failed';
        }
        return $this->rest->output($response, $data);
    }
}
