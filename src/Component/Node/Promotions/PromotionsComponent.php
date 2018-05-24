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

        $data['is_login'] = $this->playerSession->isLogin();
        $data['field_sticky_url'] = isset($options['node']['field_sticky_url'][0]['uri'])
                ? $this->url->generateUri($options['node']['field_sticky_url'][0]['uri'], []) : ['uri' => '#'];
        $data['field_sticky_url2'] = isset($options['node']['field_sticky_url2'][0]['uri'])
                ? $this->url->generateUri($options['node']['field_sticky_url2'][0]['uri'], []) : ['uri' => '#'];
        $data['field_post_banner_link'] = isset($options['node']['field_post_banner_link'][0]['uri'])
                ? $this->url->generateUri($options['node']['field_post_banner_link'][0]['uri'], []) : ['uri' => '#'];
        $data['field_banner_link'] = isset($options['node']['field_banner_link'][0]['uri'])
                ? $this->url->generateUri($options['node']['field_banner_link'][0]['uri'], []) : ['uri' => '#'];

        return $data;
    }
}
