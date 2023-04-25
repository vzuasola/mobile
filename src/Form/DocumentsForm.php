<?php
namespace App\MobileEntry\Form;

use App\Plugins\Form\FormInterface;
use App\Extensions\Form\ConfigurableForm\FormBase;

/**
 * Class for Creating DocumentsForm
 */
class DocumentsForm extends FormBase implements FormInterface
{
    protected $product = 'account';

    /**
     * @{inheritdoc}
     */
    public function getFormId()
    {
        return 'documents_form';
    }

    /**
     * Container dependency injection
     */
    public function setContainer($container)
    {
        parent::setContainer($container);
        $this->user = $container->get('user_fetcher');
    }

    /**
     * @{inheritdoc}
     */
    public function alterFormDefinition($definition, $data, $options)
    {
        foreach ($definition as $key => $formField) {
            if (strpos($formField['type'], 'TextType') !== false ||
                strpos($formField['type'], 'PasswordType') !== false
            ) {
                $this->moveAttribute($definition, $key, 'placeholder', 'placeholder');
            }
        }

        $definition['submit']['options']['attr']['class'] = "btn btn-small btn-yellow btn-lower-case";

        // Select Language Field
        $choice = $definition['purpose']['options']['choices'];
        unset($definition['purpose']['options']['choices']);
        $choices = $this->pipeToChoices($choice);
        $definition['purpose']['options']['choices'] = $choices;
        $definition['purpose']['options']['placeholder'] = false;

        return $definition;
    }

    /**
     * @{inheritdoc}
     */
    public function submit($form, $options)
    {
    }
}
