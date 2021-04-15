<?php

namespace App\MobileEntry\Controller;

use App\BaseController;
use Slim\Exception\NotFoundException;

class RestController extends BaseController
{
    /**
     *
     */
    public function getJson($request, $response, $args)
    {
        $result = [];
        $languageParam = $request->getQueryParams();
        $language = $languageParam['language'] ?? 'en';

        $loginData = $this->formatData($this->getLoginData(), $language);

        $result =  array_merge($loginData);
 
        return $this->rest->output($response, $result);
    }

    /**
     * Get login text, labels and configurations
     */
    private function getLoginData()
    {
        try {
            $headerConfigs = $this->get('config_fetcher')
                ->getConfig('webcomposer_config.header_configuration');
        } catch (\Exception $e) {
            $headerConfigs = [];
        }

        $data['remember_username'] = $headerConfigs['mobile_remember'] ?? 'Remember Username';
        $data['text_join_now'] = $headerConfigs['join_now_text'] ?? 'Join Now';
        $data["loginscreen_can't_login"] = $headerConfigs['login_issue_text'] ?? 'Cant Login ?';

        try {
            $loginConfigs =  $this->get('config_fetcher')
                ->getConfig('webcomposer_config.login_configuration');
        } catch (\Exception $e) {
            $loginConfigs = [];
        }

        $data['input_label_username'] = $loginConfigs['username_placeholder'] ?? 'Username';
        $data['input_label_password'] = $loginConfigs['password_placeholder'] ?? 'Password';
        $data['1'] = $loginConfigs['login_bottom_label'] ?? 'Login';
        $data['loginscreen_register_ask'] = $loginConfigs['lightbox_blurb'] ?? 'Not yet a Dafabet member ?';
        $data['blank_username'] = $loginConfigs['error_message_blank_username'] ?? '';
        $data['blank_password'] = $loginConfigs['error_message_blank_password'] ?? '';
        $data['blank_passname'] = $loginConfigs['error_message_blank_passname'] ?? '';
        $data['loginscreen_message_err'] = $loginConfigs['error_message_invalid_passname'] ?? '';
        $data['error_message_restricted_country'] = $loginConfigs['error_message_restricted_country'] ?? '';
        $data['service_not_available'] = $loginConfigs['error_message_service_not_available'] ?? '';
        $data['account_suspended'] = $loginConfigs['error_message_account_suspended'] ?? '';
        $data['account_locked'] = $loginConfigs['error_message_account_locked'] ?? '';

        return $data;
    }

    /**
     * Format array
     */
    private function formatData($data, $language)
    {
        $formatted = [];
        foreach ($data as $key => $value) {
            $formatted[] = [
                'id' => $key,
                'data' => [
                    $language => $value
                ]
            ];
        }

        return $formatted;
    }
}
