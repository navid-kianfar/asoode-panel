import {Injectable} from '@angular/core';
import {IFormElement, IFormElementCaptcha, IFormElementInput, IFormGroup} from '../../components/core/form/contracts';
import {FormElementType} from '../../library/core/enums';

const CAPTCHA_LENGTH = 5;

@Injectable({
  providedIn: 'root'
})
export class FormService {

  constructor() { }

  createInput(options: IFormElementInput): IFormElementInput {
    options.type = FormElementType.Input;
    options.validation = options.validation || { required: { value: false } };
    return options;
  }

  createCaptcha(): IFormElementCaptcha {
    return {
      validation: {
        required: { value: true, message: 'CAPTCHA_REQUIRED' },
        length: { value: CAPTCHA_LENGTH, message: 'CAPTCHA_LENGTH' }
      },
      config: { field: 'captcha', label: 'GENERAL_CAPTCHA' },
      params: { model: { code: '', expire: '', token: '' } },
      type: FormElementType.Captcha
    } as IFormElementCaptcha;
  }

  prepare(form: IFormGroup[]): any {
    this.clearErrors(form);
    const model = this.getModel(form);
    const isValid = this.validateModel(form, model);
    if (!isValid) { return null; }
    return model;
  }
  clearErrors(form: IFormGroup[]) {
    form.forEach(group => {
      group.elements.forEach(element => {
        if (!element.validation) { return; }
        element.validation.errors = [];
      });
    });
  }
  setErrors(form: IFormGroup[], field: string, errors: string[]) {
    form.forEach(group => {
      group.elements.forEach(element => {
        if (!element.validation || element.config.field !== field) { return; }
        element.validation.errors = errors;
      });
    });
  }
  getModel(form: IFormGroup[]): any {
    const model = {} as any;
    form.forEach(group => {
      group.elements.forEach(element => {
        model[element.config.field] = element.params.model;
      });
    });
    return model;
  }
  private validateModel(form: IFormGroup[], model: any): boolean {
    let isValid = true;
    form.forEach(group => {
      group.elements.forEach(element => {
        if (!element.validation) { return; }
        const validated = this.validateField(element, model);
        if (validated) { return; }
        isValid = false;
      });
    });
    return isValid;
  }
  private validateField(element: IFormElement, model: any): boolean {
    switch (element.type) {
      case FormElementType.Input:
      case FormElementType.AutoComplete:
        return this.validateString(element, model);
      case FormElementType.Captcha:
        return this.validateCaptcha(element);
      case FormElementType.DatePicker:
        return this.validateDate(element);
      case FormElementType.Radio:
      case FormElementType.Checkbox:
      case FormElementType.Switch:
      case FormElementType.ZonePicker:
      case FormElementType.CountryPicker:
      case FormElementType.DropDown:
      case FormElementType.Editor:
      case FormElementType.LocationPicker:
        return this.validateDefined(element);
      case FormElementType.ColorPicker:
        return this.validateColor(element);
      case FormElementType.File:
        return this.validateFile(element);
      case FormElementType.Tag:
        return this.validateArray(element);
    }
  }
  private validateDefined(element: IFormElement): boolean {
    const isValid = element.params.model !== undefined;
    if (!isValid) {
      element.validation.errors = [ element.validation.required.message ];
    }
    return isValid;
  }
  private validateCaptcha(element: IFormElement): boolean {
    const code = (element.params.model as any).code;
    if (!code) {
      element.validation.errors = [ element.validation.required.message ];
      return false;
    }
    if (code.length !== CAPTCHA_LENGTH) {
      element.validation.errors = [ element.validation.length.message ];
      return false;
    }
    return true;
  }
  private validateString(element: IFormElement, model: any): boolean {
    if (element.validation.required && element.validation.required.value) {
      if (!element.params.model || !element.params.model.length) {
        element.validation.errors = [element.validation.required.message];
        return false;
      }
    }
    if (element.validation.match && element.validation.match.toField) {
      if (element.params.model !== model[element.validation.match.toField]) {
        element.validation.errors = [element.validation.match.message];
        return false;
      }
    }
    if (element.validation.length && element.validation.length.value) {
      if (!element.params.model || element.params.model.length !== element.validation.length.value) {
        element.validation.errors = [element.validation.length.message];
        return false;
      }
    }
    if (element.validation.minLength && element.validation.minLength.value) {
      if (!element.params.model || element.params.model.length < element.validation.minLength.value) {
        element.validation.errors = [element.validation.minLength.message];
        return false;
      }
    }
    if (element.validation.maxLength && element.validation.maxLength.value) {
      if (element.params.model.length > element.validation.maxLength.value) {
        element.validation.errors = [element.validation.maxLength.message];
        return false;
      }
    }
    return true;
  }
  private validateArray(element: IFormElement): boolean {
    return false;
  }
  private validateDate(element: IFormElement): boolean {
    return false;
  }
  private validateColor(element: IFormElement): boolean {
    return false;
  }
  private validateFile(element: IFormElement): boolean {
    return false;
  }
}
