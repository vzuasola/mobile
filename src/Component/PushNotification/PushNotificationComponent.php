<?php

namespace App\MobileEntry\Component\PushNotification;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class PushNotificationComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $pnxconfig;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    /**
     * string
     */
    private $playerLocale;
    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('user_fetcher'),
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $config,
        $user,
        $playerSession
    ) {
        $this->config = $config;
        $this->user = $user;
        $this->playerDetails = false;
        $this->playerSession = $playerSession;
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/PushNotification/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $this->pnxconfig = $this->config->getGeneralConfigById('pushnx_configuration');

        if ($this->playerSession->isLogin()) {
            $this->playerDetails = $this->user->getPlayerDetails();
            $this->playerLocale = strtolower($this->playerDetails['locale']);
        }

        $translated = $this->parseTranslatedTexts($this->pnxconfig['translated_texts']);

        $data['title'] = $translated['notifications'];
        $data['dismiss_button_label'] = $this->pnxconfig['dismiss_button_label'];

        return $data;
    }

    /**
     * Parse translated texts
     */
    private function parseTranslatedTexts($translation)
    {
        $map = array_map('trim', explode(PHP_EOL, $translation));
        $map = str_replace(' ', '', $map);

        $texts = [];

        foreach ($map as $value) {
            $key = strtolower($value);
            $index = 'text_' . $key;
            $data = $this->getConfigByPlayerLocale($index);
            $texts[$key] = $data;
        }

        return $texts;
    }

    /**
     * Get config by player locale
     */
    private function getConfigByPlayerLocale($index)
    {
        if (isset($this->pnxconfig[$index])) {
            $map = array_map('trim', explode(PHP_EOL, $this->pnxconfig[$index]));
            foreach ($map as $value) {
                list($lang, $text) = explode('|', $value);
                if (strtolower($lang) == $this->playerLocale) {
                    return $text;
                }
                // Fallback for empty locale
                if (!$this->playerLocale) {
                    return $text;
                }
            }
        }
    }
}
