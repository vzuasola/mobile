<?php

namespace App\MobileEntry\Component\Main\ContactUsForm;

use App\Utils\IP;
use App\Player\Player;
use App\Fetcher\Integration\Exception\ServerDownException;

/**
 *
 */
class ContactUsFormComponentController
{
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     * Rest Object.
     */
    private $rest;

    /**
     * User Fetcher Object
     */
    private $userFetcher;

    /**
     * Player Session Object.
     */
    private $playerSession;

    /**
     * Session Object.
     */
    private $session;

    /**
     * @var App\Fetcher\Drupal\Views
     */
    private $views;

    private $mail;

    private $lang;

    private $asset;

    private $url;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('rest'),
            $container->get('user_fetcher'),
            $container->get('player_session'),
            $container->get('session'),
            $container->get('views_fetcher'),
            $container->get('mail_fetcher'),
            $container->get('lang'),
            $container->get('asset'),
            $container->get('uri')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $configs,
        $rest,
        $userFetcher,
        $playerSession,
        $session,
        $views,
        $mail,
        $lang,
        $asset,
        $url
    ) {
        $this->configs = $configs;
        $this->rest = $rest;
        $this->userFetcher = $userFetcher;
        $this->playerSession = $playerSession;
        $this->session = $session;
        $this->views = $views;
        $this->mail = $mail;
        $this->lang = $lang;
        $this->asset = $asset;
        $this->url = $url;
    }

    /**
     * Contact us submit handler
     */
    public function submit($request, $response)
    {
        $formData = $request->getParam('form');
        $data = [];
        $postData = [];

        try {
            $configData = $this->configs
                ->getConfig('contact_us_config.contact_us_configuration');
        } catch (\Exception $e) {
            $configData['from_email'] = 'no-reply@dafabet.com';
        }

        if (isset($formData['subject'])) {
            // prepare Form Data
            $explode = array_pad(explode('|', $formData['subject']), 3, null);
            list($product, $to, $subject) = $explode;

            $postData = [
                'langcode' => $this->lang,
                'module' => 'contact_us_config',
                'key' => 'contact_us',
                'to' => $to,
                'from' => $configData['from_email']
            ];
            $postData['params'] = [
                'firstname' => $formData['first_name'],
                'lastname' => $formData['last_name'],
                'username' => $formData['username'],
                'email' => $formData['email'],
                'product' => $product,
                'subject' => $subject,
                'body' => $formData['message'],
                'date' => time(),
                'ip' => IP::getIpAddress()
            ];
        }

        try {
            // send Mail to API and Drupal
            $mailRequest = $this->mail->sendMail($postData);
            $requestBody = json_decode($mailRequest->getBody()->getContents(), true);
        } catch (\Exception $e) {
            // set exception api error
            $error = json_decode($e->getResponse()->getBody()->getContents(), true);
            if (isset($error['responseCode'])) {
                $data['success'] = false;
                $data['message'] = $error['responseMessage'];
            }
        }

        if (isset($requestBody['responseCode'])) {
            // redirect to success page
            if (isset($requestBody['body']['success'])) {
                $data['success'] = true;
                $data['message'] = $configData['success_message']['value'];
            }

            // set flood/email error message
            if (isset($requestBody['body']['error'])) {
                $data['success'] = false;
                $data['message'] = $requestBody['body']['error'];
            }
        }

        return $this->rest->output($response, $data);
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function contactUsTabs($request, $response)
    {
        try {
            $views = $this->views;
            $contactTabs = $views->getViewById('contact_tabs');
            $data['contactTabs'] = $this->processContactTabs($contactTabs);
        } catch (\Exception $e) {
            $data['contactTabs'] = [];
        }

        try {
            $data['contact_blurb'] = $this->configs->getConfig('contact_us_config.contact_us_configuration');
            $contactPageImg = $data['contact_blurb']['file_image_page_image'] ?? '';
            $data['contact_blurb']['file_image_page_image'] = $this->asset->generateAssetUri($contactPageImg,
            ['product' => 'mobile-entrypage']);
        } catch (\Exception $e) {
            $data['contact_blurb'] = [];
        }

        return $this->rest->output($response, $data);
    }

    private function processContactTabs($data)
    {
        try {
            $contactTabsList = [];
            foreach ($data as $contactTabsItem) {
                $contactTabsData = [];
                $contactTabsData['field_title'] = $contactTabsItem['field_title'];
                $contactTabsData['field_tab_content'] = $contactTabsItem['field_tab_content'];
                $contactTabsData['field_tab_class'] = $contactTabsItem['field_tab_class'];

                $contactTabsList[] = $contactTabsData;
            }
        } catch (\Exception $e) {
            $contactTabsList = [];
        }

        return $contactTabsList;
    }
}
