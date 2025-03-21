<?php

namespace App\MobileEntry\Component\Main\MyAccount\Bonuses;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Form\BonusCodeForm;

class BonusesComponent implements ComponentWidgetInterface
{

    /**
     * Form manager object.
     */
    private $formManager;

    /**
     * Config Fetcher object.
     */
    private $configFetcher;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('form_manager'),
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($formManager, $configFetcher)
    {
        $this->formManager = $formManager;
        $this->configFetcher = $configFetcher->withProduct('account');
    }

    /**
     * {@inheritdoc}
     */
    public function getTemplate()
    {
        return '@component/Main/MyAccount/Bonuses/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        $formBonusCode = $this->formManager->getForm(BonusCodeForm::class);
        $config = $this->configFetcher->getConfig('webcomposer_config.bonus_code_configuration');
        $isEnable = ($config['enabled'] === 1 ? true : false);
        $successMessage = $config['success_messsage']['value'] ?? '';
        $failedMessage = $config['invalid_code'];

        return [
            'formBonusCode' => $formBonusCode->createView(),
            'enableBonusCode' => $isEnable,
            'successMessage' => $successMessage,
            'failedMessage' => $failedMessage
        ];
    }
}
