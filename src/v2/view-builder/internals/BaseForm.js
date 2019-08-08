import { Form, loc, _ } from 'okta' ;
import FormInputFactory from './FormInputFactory';

export default Form.extend({

  layout: 'o-form-theme',
  className: 'ion-form',
  hasSavingState: true,
  autoSave: false,
  noCancelButton: true,
  title: 'Authenticate',
  save: loc('oform.next', 'login'),

  initialize: function () {
    const inputOptions = this.createInputs();

    inputOptions.forEach(input => {
      this.addInputOrView(input);
    });

    this.listenTo(this, 'save', this.saveForm);
    this.checkAndDoPolling(this.options.remediationValue, this.options.model);
  },


  checkAndDoPolling (remediationValue, model) {
    // auto 'save' the form if `refresh` is set. a.k.a polling
    // UI will re-render per response even it might be same response
    // thus don't need `setInterval`.
    // (because FormController listen to 'change:currentState' and
    //  'currentState` will be re-created per response hence it's different object.
    //  )
    if (_.isNumber(remediationValue.refresh)) {
      this.polling = _.delay(this.saveForm.bind(this, model), remediationValue.refresh);
    }
  },

  saveForm (model) {
    this.options.appState.trigger('saveForm', model);
  },

  createInputs () {
    return this.options.remediationValue.uiSchema.map(FormInputFactory.create);
  },

  addInputOrView (input) {
    if (input.View) {
      this.add(input.View, {
        options: input.options
      });
    } else {
      this.addInput(input);
    }
  },

  remove () {
    Form.prototype.remove.apply(this, arguments);

    if (this.polling) {
      clearTimeout(this.polling);
    }
  }

});
