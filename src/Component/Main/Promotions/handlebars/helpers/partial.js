// define(['Handlebars'], function (Handlebars) {

//     function dynamictemplate(template, context, opts) {
//         template = `svg/product-${template}.handlebars`;
//         var f = Handlebars.partials[template];
//         if (!f) {
//             return "Partial not loaded";
//         }

//         return new Handlebars.SafeString(f(context));
//     }

//     Handlebars.registerHelper('dynamictemplate', dynamictemplate);
//     return dynamictemplate;
// });
import Handlebars from 'handlebars';

module.exports = function(template, context, opts) {
    template = `svg/product-${template}.handlebars`;
    var f = Handlebars.partials[template];
    if (!f) {
        return "Partial not loaded";
    }

    return new Handlebars.SafeString(f(context));
};
