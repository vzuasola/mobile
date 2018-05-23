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
        $data['field_sticky_url'] = isset($options['node']['field_sticky_url'][0]['uri'])
                ? $this->url->generateUri($options['node']['field_sticky_url'][0]['uri'], []) : ['uri' => '#'];
        $data['field_sticky_url_text'] = $options['node']['field_sticky_url'][0]['title'] ?? '';
        $data['field_sticky_link_target'] = $options['node']['field_sticky_link_target'][0]['value'] ?? '';
        $data['sticky_enabled_1'] = $options['node']['field_enable_sticky_component'][0]['value'] ?? false;
        $data['field_sticky_background_color'] = $options['node']['field_sticky_background_color'][0]['color'] ?? '';
        $data['field_sticky_text_color'] = $options['node']['field_sticky_text_color'][0]['color'] ?? '';

        $data['field_sticky_url2'] = isset($options['node']['field_sticky_url2'][0]['uri'])
                ? $this->url->generateUri($options['node']['field_sticky_url2'][0]['uri'], []) : ['uri' => '#'];
        $data['field_sticky_url_text2'] = $options['node']['field_sticky_url2'][0]['title'] ?? '';
        $data['field_sticky_link_target2'] = $options['node']['field_sticky_link_target2'][0]['value'] ?? '';
        $data['sticky_enabled_2'] = $options['node']['field_enable_sticky_component2'][0]['value'] ?? false;
        $data['sticky_enabled_full'] = ($data['sticky_enabled_1'] && $data['sticky_enabled_2'])
            ? false : true;
        $data['field_sticky_background_color2'] = $options['node']['field_sticky_background_color2'][0]['color'] ?? '';
        $data['field_sticky_text_color2'] = $options['node']['field_sticky_text_color2'][0]['color'] ?? '';

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
