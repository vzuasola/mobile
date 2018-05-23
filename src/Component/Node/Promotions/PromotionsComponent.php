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
            $node = $options['node'];
        } catch (\Exception $e) {
            $node = [];
        }

        $data['title'] = $options['node']['title'][0]['value'] ?? '';
        if ($this->playerSession->isLogin()) {
            $data['field_banner_image'] = $options['node']['field_post_banner_image'][0]['url'] ?? '';
            $data['field_banner_link'] = isset($options['node']['field_post_banner_link'][0]['uri'])
                ? $this->url->generateUri($options['node']['field_post_banner_link'][0]['uri'], []) : ['uri' => '#'];
            $data['field_banner_link_target'] = $options['node']['field_post_banner_link_target'][0]['value'] ?? '';
            $data['field_body'] = $options['node']['post_body'][0]['value'] ?? '';
        } else {
            $data['field_banner_image'] = $options['node']['field_banner_image'][0]['url'] ?? '';
            $data['field_banner_link'] = isset($options['node']['field_banner_link'][0]['uri'])
                ? $this->url->generateUri($options['node']['field_banner_link'][0]['uri'], []) : ['uri' => '#'];
            $data['field_banner_link_target'] = $options['node']['field_banner_link_target'][0]['value'] ?? '';
            $data['field_body'] = $options['node']['body'][0]['value'] ?? '';
        }

        return $data;
    }
}
