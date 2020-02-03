<?php

namespace App\MobileEntry\Component\Language\INLanguage;

use App\Player\Player;

class INLanguageComponentController
{
    const INDIA_LANGUAGES = [
        'en-in' => 'in',
        'te' => 'te',
        'in' => 'hi',
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
            $container->get('preferences_fetcher')
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
        $preferences
    ) {
        $this->configs = $configs;
        $this->rest = $rest;
        $this->playerSession = $playerSession;
        $this->language = $language;
        $this->user = $user;
        $this->session = $session;
        $this->preferences = $preferences;

    }


    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function language($request, $response)
    {
        $data = [];

        try {
            $entrypageConfigs = $this->configs->getConfig('mobile_entrypage.entrypage_configuration');
        } catch (\Exception $e) {
            $entrypageConfigs = [];
        }

        $data['mobile_language_svg_class'] = $entrypageConfigs['mobile_language_svg_class'] ?? 'in-language';
        $data['mobile_india_language_select'] = $entrypageConfigs['mobile_language_select'] ?? 'Select your Language';
        $data['mobile_india_language_description'] =
            $entrypageConfigs['mobile_language_description_select'] ?? '';

        return $this->rest->output($response, $data);
    }

    public function details($request, $response)
    {
        $data = [];

        try {
            $iCoreLang = strtolower($this->playerSession->getDetails()['locale']);
            $data['language'] = $this->language->getLanguages()[$iCoreLang]['prefix'] ?? 'in';
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
