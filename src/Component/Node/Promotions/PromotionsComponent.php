<?php

namespace App\MobileEntry\Component\Node\Promotions;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use Slim\Exception\NotFoundException;

class PromotionsComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $config;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $config)
    {
        $this->playerSession = $playerSession;
        $this->config = $config;
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
            $promoConfigs = $this->config->getConfig('mobile_promotions.promotions_configuration');
        } catch (\Exception $e) {
            $promoConfigs = [];
        }

        $data['count_down_text'] = "";
        $countdownFormat = $promoConfigs['countdown_format'] ?? "[days] days, [hours] hours remaining";
        $countdownFormat = str_replace(['[days]', '[hours]'], ['%d', '%h'], $countdownFormat);
        $data['is_login'] = $this->playerSession->isLogin();

        if (!$options['node']['field_hide_countdown'][0]['value'] && $options['node']['unpublish_on'][0]['value']) {
            $startDate = new \DateTime("now");
            $endDate = new \DateTime($options['node']['unpublish_on'][0]['value']);

            $interval = $startDate->diff($endDate);
            if ((int) $interval->format("%d") >= 0 && (int) $interval->format("%h") > 0) {
                $data['count_down_text'] = $interval->format($countdownFormat);
            }
        }

        return $data;
    }
}
