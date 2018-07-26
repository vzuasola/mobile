<?php

namespace App\MobileEntry\Form;

use App\Plugins\Form\FormInterface;
use App\Extensions\Form\ConfigurableForm\FormBase;

class ResetPasswordForm extends FormBase implements FormInterface
{

    protected $product = 'account';

    /**
     * @{inheritdoc}
     */
    public function getFormId()
    {
        return 'account_reset_password_form';
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
                $this->createAttribute($definition, $key, 'placeholder', 'placeholder');
            }

            $this->createAttribute($definition, $key, 'annotation', 'data-annotation');
            $this->createAttribute($definition, $key, 'annotation_weak', 'data-annotation-weak');
            $this->createAttribute($definition, $key, 'annotation_average', 'data-annotation-average');
        }

        $definition['submit']['options']['attr']['class'] = "btn btn-small btn-yellow btn-changepass btn-lower-case";
        return $definition;
    }

    /**
     * @{inheritdoc}
     */
    public function submit($form, $options)
    {
    }

    /**
     * Create Field Attribute.
     */
    private function createAttribute(&$definition, $key, $attrKey, $attrName)
    {
        if (isset($definition[$key]['options'][$attrKey])) {
            $value = $definition[$key]['options'][$attrKey];
            if ($value) {
                $definition[$key]['options']['attr'][$attrName] = $value;
            }
            unset($definition[$key]['options'][$attrKey]);
        }
    }
}
