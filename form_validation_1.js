document.addEventListener('DOMContentLoaded', () => {
  const FormValidation = {
    init() {
      this.requiredFields = ['first_name', 'last_name', 'email', 'password'];
      this.form = document.querySelector('form');
      this.creditCardInputs = Array.prototype.slice.call(document.querySelectorAll('[name="credit_card"]'));
      this.inputs = Array.prototype.slice.call(this.form.querySelectorAll('input'));
      this.errorSpans = Array.prototype.slice.call(this.form.getElementsByClassName('error_message'));
      this.bindEvents();
    },

    bindEvents() {
      this.form.addEventListener('submit', this.checkValidForm.bind(this));
      this.form.addEventListener('focus', event => {
        if (event.target.tagName === 'INPUT') {
          this.resetError(event);
        }
      }, true);
      this.form.addEventListener('blur', event => {
        if (event.target.tagName === 'INPUT') {
          this.checkValidInput(event);
        }
      }, true);
      this.form.addEventListener('invalid', this.markInvalid.bind(this), true);
      this.form.addEventListener('keydown', this.checkKeyBlock.bind(this));

      this.creditCardInputs[0].parentElement.addEventListener('keyup', this.switchFocus.bind(this));
    },

    switchFocus(event) {
      let currentInput = event.target;
      let index = this.creditCardInputs.indexOf(currentInput);
      let nextInput = this.creditCardInputs[index + 1];
      let prevInput = this.creditCardInputs[index - 1];

      if ((nextInput === this.currentCCInput) || (prevInput === this.currentCCInput) || event.key === 'Shift' || event.key === 'Tab') {
        currentInput.focus();
        this.currentCCInput = null;
        return;
      }

      if (this.creditCardInputs.slice(0, 3).includes(event.target)) {
        let index = this.creditCardInputs.indexOf(currentInput);
        let nextInput = this.creditCardInputs[index + 1];

        if (currentInput.value.length === Number(currentInput.getAttribute('maxlength'))) {
          nextInput.focus();
        }
      }
    },

    checkKeyBlock(event) {
      let input = event.target;
      let inputId = input.getAttribute('id');
      let numericOnly = ['phone', 'cd1', 'cd2', 'cd3', 'cd4'];
      let alphaOnly = ['first_name', 'last_name'];
      if (event.target.tagName === 'INPUT' && alphaOnly.includes(inputId)) {
        this.blockNonAlpha(event, input);
      } else if (event.target.tagName === 'INPUT' && numericOnly.includes(inputId)) {
        this.blockNonNumeric(event, input);
      }
    },

    checkTab(event, input) {
      let tabKey;
      if (event.key === 'Tab') {
        event.preventDefault();
        tabKey = true;
        let index = this.inputs.indexOf(input);
        let nextInput = this.inputs[index + 1];
        let prevInput = this.inputs[index - 1];
        this.currentCCInput = input;

        if (event.shiftKey && prevInput) {
          prevInput.focus();
        } else if (!event.shiftKey && nextInput) {
          nextInput.focus();
        } else {
          input.blur();
        }
      }

      return tabKey;
    },

    blockNonAlpha(event, input) {
      let key = event.key;
      if (this.checkTab(event, input)) return;
      let alphaKey = key.match(/[a-zA-Z'\s]/);
      if (!alphaKey) {
        event.preventDefault();
      }
    },

    blockNonNumeric(event, input) {
      let key = event.key;
      if (this.checkTab(event, input)) return;
      let phoneKey = (key === 'Backspace') || key.match(/[0-9-]/);
      let creditKey = (key === 'Backspace') || key.match(/[0-9]/);
      if (input.getAttribute('id') === 'phone' && !phoneKey) {
        event.preventDefault();
      } else if (this.isCreditCardInput(input) && !creditKey) {
        event.preventDefault();
      }
    },

    isCreditCardInput(input) {
      let inputId = input.getAttribute('id');
      let creditCardIds = ['cd1', 'cd2', 'cd3', 'cd4'];
      return creditCardIds.includes(inputId);
    },

    checkValidForm(event) {
      event.preventDefault();
      let formErrors = document.querySelector('.form_errors');

      this.inputs.forEach(input => {
        input.dispatchEvent(new Event('blur'));
      });
      if (!this.checkAnyErrors()) {
        this.submitForm();
        this.form.reset();
      } else {
        formErrors.textContent = 'Form cannot be submitted until errors are corrected.';
      }
    },

    submitForm() {
      let data = new FormData(this.form);
      let creditCardNum = data.getAll('credit_card').join('');
      data.set('credit_card', creditCardNum);
      let queryString = new URLSearchParams(data).toString();
      let request = new XMLHttpRequest();
      request.open('POST', this.form.getAttribute('action'));
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');

      let serializedArea = document.querySelector('.serialized');
      let p = document.createElement('p');
      p.textContent = queryString;
      serializedArea.insertAdjacentElement('beforeend', p);

      // request.addEventListener('load', event => {
      //   let response = request.response;
      //   alert('Form submitted');
      // });

      // request.send(queryString);
    },

    // formDataToObj(formData) {
    //   let obj = {};

    //   for (let pair of formData.entries()) {
    //     let key = pair[0];
    //     let value = pair[1];

    //     obj[key] = value;
    //   }

    //   return obj;
    // },

    checkAnyErrors() {
      let formErrors = document.querySelector('.form_errors');
      let errorsPresent;

      if (this.errorSpans.some(errorSpan => errorSpan.textContent !== '')) {
        errorsPresent = true;
      } else {
        formErrors.textContent = '';
      }

      return errorsPresent;
    },

    resetError(event) {
      let input = event.target;
      let errorSpan = input.nextElementSibling;
      if (this.isCreditCardInput(input)) {
        errorSpan = input.parentElement.lastElementChild;
      }
      input.classList.remove('invalid_field');
      errorSpan.textContent = '';
    },

    checkValidInput(event) {
      let input = event.target;
      let errorSpan = input.nextElementSibling;

      if (this.isCreditCardInput(input)) {
        this.checkCreditCardValidity(event);
      } else {
        let valid = input.checkValidity();
        if (valid) {
          input.classList.remove('invalid_field');
          errorSpan.textContent = '';
        }
      }
      this.checkAnyErrors();
    },

    checkCreditCardValidity(event) {
      let creditCardInputs = Array.prototype.slice.call(document.querySelectorAll('[name="credit_card"]'));
      let startedCardInput = creditCardInputs.some(input => input.value.length > 0);
      let allFilledIn = creditCardInputs.every(input => input.value.length === Number(event.target.getAttribute('maxlength')));
      let errorSpan = creditCardInputs[0].parentElement.lastElementChild;

      if (startedCardInput && !allFilledIn) {
        this.markCCInputInvalid(creditCardInputs);
        let errorMessage = this.customMessage(event.target.getAttribute('id'));
        errorSpan.textContent = errorMessage;
      } else {
        errorSpan.textContent = '';
        this.markCCInputValid(creditCardInputs);
      }
    },

    markCCInputInvalid(creditCardInputs) {
      creditCardInputs.forEach(input => {
        if (input.value.length < Number(input.getAttribute('maxlength'))) {
          input.classList.add('invalid_field');
        }
      });
    },

    markCCInputValid(creditCardInputs) {
      creditCardInputs.forEach(input => {
        if (input.value.length < Number(input.getAttribute('maxlength'))) {
          input.classList.remove('invalid_field');
        }
      });
    },

    markInvalid(event) {
      let input = event.target;
      let errorSpan = input.nextElementSibling;
      let inputName = input.getAttribute('name');
      input.classList.add('invalid_field');

      if (this.requiredFields.includes(inputName) && input.value === '') {
        errorSpan.textContent = this.requiredMessage(inputName);
      } else {
        errorSpan.textContent = this.customMessage(inputName);
      }
    },

    requiredMessage(inputName) {
      inputName = inputName.replace('_', ' ');
      inputName = inputName.split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
      return inputName + ' is a required field.';
    },

    customMessage(inputName) {
      switch (inputName) {
        case 'email':
          return 'Please Enter a valid Email.';
        case 'password':
          return 'Password must be at least 10 characters long.';
        case 'phone':
          return 'Please Enter a valid Phone Number.';
        case 'cd1':
        case 'cd2':
        case 'cd3':
        case 'cd4':
          return 'Please Enter a valid Credit Card Number.';
      }
    },
  };

  FormValidation.init();
});
