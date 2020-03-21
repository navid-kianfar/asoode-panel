import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CultureService } from '../../../services/core/culture.service';
import { FormService } from '../../../services/core/form.service';
import { FormViewModel } from '../../core/form/contracts';
import { MockService } from '../../../services/mock.service';
import {
  BoardTemplateViewModel,
  ProjectTemplateViewModel,
} from '../../../view-models/projects/project-types';
import { BoardTemplate } from '../../../library/app/enums';
import { OperationResultStatus } from '../../../library/core/enums';
import { InviteViewModel } from '../../../view-models/auth/identity-types';
import { ProjectService } from '../../../services/projects/project.service';
import { NotificationService } from '../../../services/core/notification.service';

@Component({
  selector: 'app-project-wizard',
  templateUrl: './project-wizard.component.html',
  styleUrls: ['./project-wizard.component.scss'],
})
export class ProjectWizardComponent implements OnInit {
  ViewMode = ViewMode;
  BoardTemplate = BoardTemplate;
  @Input() complex: boolean;
  @Output() back = new EventEmitter();
  @Output() exit = new EventEmitter();
  mode: ViewMode;
  projectForm: FormViewModel[];
  template: ProjectTemplateViewModel;
  boardTemplates: BoardTemplateViewModel[];
  boardTemplate: BoardTemplate;
  model: any;
  members: InviteViewModel[];
  groups: InviteViewModel[];
  actionWaiting: boolean;
  constructor(
    readonly cultureService: CultureService,
    private readonly formService: FormService,
    readonly projectService: ProjectService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit() {
    this.members = [];
    this.groups = [];
    this.boardTemplate = BoardTemplate.Blank;
    this.mode = ViewMode.Form;
    this.projectForm = [
      {
        elements: [
          this.formService.createInput({
            config: {
              field: 'title',
              label: '',
              cssClass: 'project-title',
              hideLabel: true,
            },
            params: { model: '', placeHolder: 'PROJECT_TITLE' },
            validation: {
              required: {
                value: true,
                message: 'PROJECT_TITLE_REQUIRED',
              },
            },
          }),
          this.formService.createInput({
            config: { field: 'description', label: '', hideLabel: true },
            params: { model: '', textArea: true, placeHolder: 'DESCRIPTION' },
          }),
          this.formService.createCheckbox({
            config: { field: 'channel', label: '' },
            params: {
              model: true,
              label: 'PROJECT_REQUIRE_CHANNEL',
              summary: 'PROJECT_CHANNEL_DESCRIPTION',
              disabled: true,
            },
          }),
        ],
      },
    ];
    this.boardTemplates = [
      {
        type: BoardTemplate.Blank,
        image: '/assets/images/project/blank.png',
        image_alt: '/assets/images/project/blank-enabled.png',
        lists: ['', '', ''],
      },
      {
        type: BoardTemplate.WeekDay,
        image: '/assets/images/project/weekday.png',
        image_alt: '/assets/images/project/weekday-enabled.png',
        lists: [
          'ENUMS_WEEKDAY_SUNDAY',
          'ENUMS_WEEKDAY_MONDAY',
          'ENUMS_WEEKDAY_TUESDAY',
        ],
      },
      {
        type: BoardTemplate.TeamMembers,
        image: '/assets/images/project/team-member.png',
        image_alt: '/assets/images/project/team-member-enabled.png',
        lists: [
          'BOARD_TEMPLATES_SAMPLES_TEAM_MEMBERS_1',
          'BOARD_TEMPLATES_SAMPLES_TEAM_MEMBERS_2',
          'BOARD_TEMPLATES_SAMPLES_TEAM_MEMBERS_3',
        ],
      },
      {
        type: BoardTemplate.Departments,
        image: '/assets/images/project/departments.png',
        image_alt: '/assets/images/project/departments-enabled.png',
        lists: [
          'BOARD_TEMPLATES_SAMPLES_DEPARTMENT_1',
          'BOARD_TEMPLATES_SAMPLES_DEPARTMENT_2',
          'BOARD_TEMPLATES_SAMPLES_DEPARTMENT_3',
        ],
      },
      {
        type: BoardTemplate.Kanban,
        image: '/assets/images/project/kanban.png',
        image_alt: '/assets/images/project/kanban-enabled.png',
        lists: [
          'BOARD_TEMPLATES_SAMPLES_KANBAN_1',
          'BOARD_TEMPLATES_SAMPLES_KANBAN_2',
          'BOARD_TEMPLATES_SAMPLES_KANBAN_3',
        ],
      },
    ];
  }
  onBack($event: MouseEvent) {
    $event.stopPropagation();
    $event.preventDefault();
    if (this.mode === ViewMode.Invite) {
      this.mode = ViewMode.Form;
      return;
    }
    if (this.mode === ViewMode.Template) {
      this.mode = ViewMode.Invite;
      return;
    }
    this.back.emit();
  }
  async onCancel($event: MouseEvent) {
    $event.stopPropagation();
    $event.preventDefault();
    this.exit.emit();
  }
  next($event: MouseEvent) {
    $event.stopPropagation();
    $event.preventDefault();
    if (this.mode === ViewMode.Form) {
      this.model = this.formService.prepare(this.projectForm);
      if (!this.model) {
        return;
      }
      this.mode = ViewMode.Invite;
      return;
    }
    if (this.mode === ViewMode.Invite) {
      this.mode = ViewMode.Template;
      return;
    }
  }
  async createProject($event: MouseEvent) {
    $event.stopPropagation();
    $event.preventDefault();
    this.model.groups = this.groups
      .filter(g => g.selected)
      .map(g => {
        return {
          id: g.id,
          access: g.access,
        };
      });
    this.model.members = this.members.map(m => {
      return {
        id: m.id,
        access: m.access,
      };
    });
    this.actionWaiting = true;
    const op = await this.projectService.create({
      ...this.model,
      boardTemplate: this.boardTemplate,
      templateId: this.template ? this.template.id : undefined,
      complex: this.complex,
    });
    this.actionWaiting = false;
    if (op.status !== OperationResultStatus.Success) {
      // TODO: handle error
      return;
    }
    this.notificationService.success('PROJECT_CREATED');
    this.exit.emit();
  }
}

export enum ViewMode {
  Form = 1,
  Invite = 2,
  Template = 3,
}
