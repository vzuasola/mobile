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
        $id = $args['id'];
        $result = [];

        if (strpos($request->getUri()->getPath(), $args['id']) !== false
            && method_exists($this, $id)) {
            $result[$id] = $this->$id($request, $response);
        } else {
            $result = [
                'code' => '404',
                'message' => 'Not Found'
            ];
        }

        return $this->rest->output($response, $result);
    }

    /**
     * Get login text, labels and configurations
     */
    private function login($request, $response)
    {
        try {
            $headerConfigs = $this->get('config_fetcher')
                ->getConfig('webcomposer_config.header_configuration');
        } catch (\Exception $e) {
            $headerConfigs = [];
        }

        $data['logo_title'] = $headerConfigs['logo_title'] ?? 'Dafabet';
        $data['label_remember_username'] = $headerConfigs['mobile_remember'] ?? 'Remember Username';
        $data['text_join_now'] = $headerConfigs['join_now_text'] ?? 'Join Now';
        $data['link_join_now'] = $headerConfigs['registration_link'] ?? 'https://www.dafabet.com/en/join';
        $data['text_cant_login'] = $headerConfigs['login_issue_text'] ?? 'Cant Login ?';
        $data['link_cant_login'] = $headerConfigs['login_issue_link'] ?? 'https://www.dafabet.com/en/cant-login';

        try {
            $loginConfigs =  $this->get('config_fetcher')
                ->getConfig('webcomposer_config.login_configuration');
        } catch (\Exception $e) {
            $loginConfigs = [];
        }

        $data['field_username_placeholder'] = $loginConfigs['username_placeholder'] ?? 'Username';
        $data['field_password_placeholder'] = $loginConfigs['password_placeholder'] ?? 'Password';
        $data['text_login_button'] = $loginConfigs['login_bottom_label'] ?? 'Login';
        $data['text_login_blurb'] = $loginConfigs['lightbox_blurb'] ?? 'Not yet a Dafabet member ?';

        $error_messages = [
            'blank_username' => $loginConfigs['error_message_blank_username'] ?? '',
            'blank_password' => $loginConfigs['error_message_blank_password'] ?? '',
            'blank_passname' => $loginConfigs['error_message_blank_passname'] ?? '',
            'invalid_passname' => $loginConfigs['error_message_invalid_passname'] ?? '',
            'error_message_restricted_country' => $loginConfigs['error_message_restricted_country'] ?? '',
            'service_not_available' => $loginConfigs['error_message_service_not_available'] ?? '',
            'account_suspended' => $loginConfigs['error_message_account_suspended'] ?? '',
            'account_locked' => $loginConfigs['error_message_account_locked'] ?? '',
        ];

        return [
            'data' => $data,
            'error_messages' => $error_messages
        ];

    }
}
