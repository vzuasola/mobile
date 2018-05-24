<?php

namespace App\MobileEntry\Component\Node\Promotions;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class PromotionsComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    private $url;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('uri')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $url)
    {
        $this->playerSession = $playerSession;
        $this->url = $url;
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
            $data['node'] = $options['node'];
        } catch (\Exception $e) {
            $data['node'] = [];
        }

        try {
            $data['field_sticky_url_pre'] = $options['node']['field_sticky_url_pre'][0]['uri'];
        } catch (\Exception $e) {
            $data['field_sticky_url_pre'] = [];
        }

        try {
            $data['field_sticky_url_pre2'] = $options['node']['field_sticky_url_pre2'][0]['uri'];
        } catch (\Exception $e) {
            $data['field_sticky_url_pre2'] = [];
        }

        try {
            $data['field_sticky_url_post'] = $options['node']['field_sticky_url_post'][0]['uri'];
        } catch (\Exception $e) {
            $data['field_sticky_url_post'] = [];
        }

        try {
            $data['field_sticky_url_post2'] = $options['node']['field_sticky_url_post2'][0]['uri'];
        } catch (\Exception $e) {
            $data['field_sticky_url_post2'] = [];
        }

        try {
            $data['field_post_banner_link'] = $options['node']['field_post_banner_link'][0]['uri'];
        } catch (\Exception $e) {
            $data['field_post_banner_link'] = [];
        }

        try {
            $data['field_banner_link'] = $options['node']['field_banner_link'][0]['uri'];
        } catch (\Exception $e) {
            $data['field_banner_link'] = [];
        }

        return $data;
    }
}
