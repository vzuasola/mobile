<?php

namespace App\MobileEntry\Component\Main\MyAccount\Documents;

use App\MobileEntry\Form\DocumentsForm;
use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class DocumentsComponent implements ComponentWidgetInterface
{

    /**
     * Form manager object.
     */
    private $formManager;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('form_manager')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($formManager)
    {
        $this->formManager = $formManager;
    }

    /**
     * {@inheritdoc}
     */
    public function getTemplate()
    {
        return '@component/Main/MyAccount/Documents/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        $formDocuments = $this->formManager->getForm(DocumentsForm::class);

        return [
            'formDocuments' => $formDocuments->createView(),
            'successMessage' => 'Submitted successfully',
            'failedMessage' => 'Failed to submit'
        ];
    }
}
