import { Component, OnInit } from '@angular/core';
import { FormViewModel } from '../../../shared/components/form/contracts';
import { Router } from '@angular/router';
import { AppInitializerProvider } from '../../../shared/services/app.initializer';
import { FormService } from '../../../shared/services/form.service';
import { IdentityService } from '../../services/identity.service';
import { ValidationService } from '../../../shared/services/validation.service';
import { TranslateService } from '../../../shared/services/translate.service';
import { OperationResultStatus } from '../../../shared/lib/enums/operation-result-status';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.scss'],
})
export class ForgotComponent implements OnInit {
  ViewMode = ViewMode;
  form: FormViewModel[];
  resetForm: FormViewModel[];
  waiting: boolean;
  mode: ViewMode;
  username: string;
  tokenId: string;
  isEmail: boolean;

  constructor(
    private readonly router: Router,
    private readonly initializerProvider: AppInitializerProvider,
    private readonly formService: FormService,
    private readonly identityService: IdentityService,
    private readonly translateService: TranslateService,
  ) {}

  ngOnInit() {
    this.mode = ViewMode.Forgot;
    this.isEmail = false;
    this.resetForm = [
      {
        elements: [
          this.formService.createInput({
            config: { field: 'password', label: 'PASSWORD' },
            params: { model: '', password: true, ltr: true },
            validation: {
              required: { value: true, message: 'PASSWORD_REQUIRED' },
              minLength: { value: 6, message: 'PASSWORD_MIN_LENGTH' },
              maxLength: { value: 50, message: 'PASSWORD_MAX_LENGTH' },
            },
          }),
          this.formService.createInput({
            config: { field: 'confirmPassword', label: 'CONFIRM_PASSWORD' },
            params: { model: '', password: true, ltr: true },
            validation: {
              required: { value: true, message: 'CONFIRM_PASSWORD_REQUIRED' },
              match: {
                toField: 'password',
                message: 'CONFIRM_PASSWORD_MISS_MATCH',
              },
            },
          }),
          this.formService.createVerification({
            config: { field: 'code', label: 'VERIFICATION_CODE' },
            params: { model: '' },
          }),
        ],
      },
    ];
    this.form = [
      {
        elements: [
          this.formService.createInput({
            config: { field: 'username', label: 'EMAIL' },
            params: { model: '', ltr: true },
            validation: {
              required: { value: true, message: 'EMAIL_REQUIRED' },
              pattern: {
                value: ValidationService.emailRegex,
                message: 'EMAIL_INVALID'
              },
            },
          }),
        ],
      },
    ];
  }

  async forgot() {
    const model = this.formService.prepare(this.form);
    if (!model) {
      return;
    }
    this.waiting = true;
    const op = await this.identityService.forgot(model);
    this.waiting = false;
    if (op.status !== OperationResultStatus.Success) {
      // TODO: handle error
      return;
    }
    if (op.data.lockedOut) {
      this.formService.setErrors(this.form, 'username', ['ACCOUNT_LOCKED_OUT']);
      return;
    }
    if (op.data.notFound) {
      this.formService.setErrors(this.form, 'username', [
        'IF_YOU_DONT_HAVE_ACCOUNT',
      ]);
      return;
    }
    if (op.data.smsFailed) {
      this.formService.setErrors(this.form, 'username', ['ACCOUNT_SMS_FAILED']);
      return;
    }
    if (op.data.emailFailed) {
      this.formService.setErrors(this.form, 'username', [
        'ACCOUNT_EMAIL_FAILED',
      ]);
      return;
    }
    if (op.data.emailNotConfirmed) {
      this.formService.setErrors(this.form, 'username', [
        'EMAIL_NOT_CONFIRMED',
      ]);
      return;
    }
    if (op.data.phoneNotConfirmed) {
      this.formService.setErrors(this.form, 'username', [
        'PHONE_NOT_CONFIRMED',
      ]);
      return;
    }

    this.mode = ViewMode.Confirm;
    this.username = model.username;
    this.tokenId = op.data.id;
    this.isEmail = ValidationService.isEmail(model.username);
  }

  async reset() {
    const model = this.formService.prepare(this.resetForm) as any;
    if (!model) {
      return;
    }
    model.id = this.tokenId;
    this.waiting = true;
    const op = await this.identityService.resetPassword(model);
    this.waiting = false;
    if (op.status !== OperationResultStatus.Success) {
      this.formService.setErrors(this.resetForm, 'code', [
        'VERIFICATION_CODE_INVALID',
      ]);
      return;
    }

    if (op.data.token) {
      await this.initializerProvider.refresh();
      await this.router.navigateByUrl('/dashboard');
      return;
    }
  }
}
export enum ViewMode {
  Forgot = 1,
  Confirm = 2,
}
