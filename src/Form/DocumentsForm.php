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
    protected $user;

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

            // Add custom field settings as data values to fields
            $dataAtts = array_filter(
                array_keys($formField['options']),
                function ($el) {
                    return strpos($el, 'data-') !== false;
                }
            );

            foreach ($dataAtts as $fieldKey) {
                $this->moveAttribute($definition, $key, $fieldKey, $fieldKey);
            }
        }


        $definition['submit']['options']['attr']['class'] = "btn btn-small btn-yellow btn-lower-case";
        $definition['purpose_markup']['options']['attr']['class'] = "field_required";

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
