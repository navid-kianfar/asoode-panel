import { Component, OnInit } from '@angular/core';
import {IFormGroup} from '../../../components/core/form/contracts';
import {FormService} from '../../../services/core/form.service';
import {Router} from '@angular/router';
import {IdentityService} from '../../../services/auth/identity.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  waiting: boolean;
  form: IFormGroup[];

  constructor(
    private readonly router: Router,
    private readonly formService: FormService,
    private readonly identityService: IdentityService,
  ) { }

  ngOnInit() {
    this.form = [
      {
        size: 6,
        elements: [
          this.formService.createInput({
            config: { field: 'firstName', label: 'FIRST_NAME' },
            params: { model: '' },
            validation: {
              required: { value: true, message: 'FIRST_NAME_REQUIRED' },
              minLength: { value: 2, message: 'FIRST_NAME_MIN_LENGTH' },
              maxLength: { value: 50, message: 'FIRST_NAME_MAX_LENGTH' },
            }
          })
        ]
      },
      {
        size: 6,
        elements: [
          this.formService.createInput({
            config: { field: 'lastName', label: 'LAST_NAME' },
            params: { model: '' },
            validation: {
              required: { value: true, message: 'LAST_NAME_REQUIRED' },
              minLength: { value: 2, message: 'LAST_NAME_MIN_LENGTH' },
              maxLength: { value: 50, message: 'LAST_NAME_MAX_LENGTH' },
            }
          })
        ]
      },
      {
        elements: [
          this.formService.createInput({
            config: { field: 'username', label: 'EMAIL_OR_PHONE' },
            params: { model: '' },
            validation: {
              required: { value: true, message: 'EMAIL_OR_PHONE_REQUIRED' },
              minLength: { value: 10, message: 'EMAIL_OR_PHONE_MIN_LENGTH' },
              maxLength: { value: 50, message: 'EMAIL_OR_PHONE_MAX_LENGTH' },
            }
          }),
          this.formService.createInput({
            config: { field: 'password', label: 'PASSWORD' },
            params: { model: '', password: true },
            validation: {
              required: { value: true, message: 'PASSWORD_REQUIRED' },
              minLength: { value: 6, message: 'PASSWORD_MIN_LENGTH' },
              maxLength: { value: 50, message: 'PASSWORD_MAX_LENGTH' },
            }
          }),
          this.formService.createInput({
            config: { field: 'confirmPassword', label: 'CONFIRM_PASSWORD' },
            params: { model: '', password: true },
            validation: {
              required: { value: true, message: 'CONFIRM_PASSWORD_REQUIRED' },
              match: { toField: 'password', message: 'CONFIRM_PASSWORD_MISS_MATCH' }
            }
          }),
          this.formService.createCaptcha(),
        ]
      }
    ];
  }

  async register() {
    const model = this.formService.prepare(this.form);
    if (!model) { return; }
    this.waiting = true;
    const op = await this.identityService.register(model);
    console.log(op);
  }
}
