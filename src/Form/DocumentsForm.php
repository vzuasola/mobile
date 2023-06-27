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
            // Grab all field attributes containing the "data-" prefix
            $dataAtts = array_filter(
                array_keys($formField['options']),
                function ($el) {
                    return strpos($el, 'data-') !== false;
                }
            );

            // For each one of those, add them as attributes to the field
            foreach ($dataAtts as $fieldKey) {
                $this->moveAttribute($definition, $key, $fieldKey, $fieldKey);
            }
        }

        // Append styling classed to specific elements
        $definition['submit']['options']['attr']['class'] = "btn btn-small btn-yellow btn-lower-case";
        $definition['purpose_markup']['options']['attr']['class'] = "field_required";
        // Check if max length rule is set, otherwise set up a dummy array in the form the rule is set.
        $maxLength = $definition['comment']['validators']['rules']['callback_max_length'] ?? [ 'arguments' => [ 250 ] ];
        $definition['comment']['options']['attr']['maxlength'] = $maxLength['arguments'][0];

        // Set Purpose select Field options
        $choice = $definition['purpose']['options']['choices'];
        unset($definition['purpose']['options']['choices']);
        $choices = $this->pipeToChoices($choice);
        $definition['purpose']['options']['choices'] = $choices;


        return $definition;
    }

    /**
     * @{inheritdoc}
     */
    public function submit($form, $options)
    {
    }
}
