<?php

namespace App\MobileEntry\Component\Node\Promotions;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class PromotionsComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession)
    {
        $this->playerSession = $playerSession;
    }

    /**
     * {@inheritdoc}
     */
    public function getTemplate($options = [])
    {
        return '@component/Node/Promotions/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData($options = [])
    {
        try {
            $isLogin = $this->playerSession->isLogin();
            $data['node'] = $options['node'];
        } catch (\Exception $e) {
            $isLogin = false;
            $data['node'] = '';
        }

        try {
            $data['field_banner_image'] = $options['node']['field_banner_image'][0]['url'];
        } catch (\Exception $e) {
            $data['field_banner_image'] = '';
        }

        try {
            $data['body'] = $options['node']['body'][0]['value'];
        } catch (\Exception $e) {
            $data['body'] = '';
        }

        $data['is_login'] = $isLogin;

        if ($isLogin) {
            try {
                $data['field_post_banner_image'] = $options['node']['field_post_banner_image'][0]['url'];
            } catch (\Exception $e) {
                $data['field_post_banner_image'] = $options['node']['field_post_banner_image'][0]['url'] = '';
            }

            try {
                $data['field_post_body'] = $options['node']['field_post_body'][0]['value'];
            } catch (\Exception $e) {
                $data['field_post_body'] = $options['node']['field_post_body'][0]['value'] = '';
            }
        }


        return $data;
    }
}
