import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import {
  ProjectViewModel,
  SubProjectViewModel,
  TreeViewModel,
  WorkPackageViewModel,
} from '../../../view-models/projects/project-types';
import {
  AccessType,
  ActivityType,
  ProjectTemplate,
} from '../../../library/app/enums';
import { ProjectService } from '../../../services/projects/project.service';
import { ModalService } from '../../../services/core/modal.service';
import { FormService } from '../../../services/core/form.service';
import { PromptComponent } from '../../../modals/prompt/prompt.component';
import { PromptModalParameters } from '../../../view-models/core/modal-types';
import { WorkPackageWizardComponent } from '../../../modals/work-package-wizard/work-package-wizard.component';
import { OperationResultStatus } from '../../../library/core/enums';
import { NotificationService } from '../../../services/core/notification.service';
import { Socket } from 'ngx-socket-io';
import { StringHelpers } from '../../../helpers/string.helpers';
import { TranslateService } from '../../../services/core/translate.service';
import { Router } from '@angular/router';
import { UpgradeComponent } from '../../../modals/upgrade/upgrade.component';
import { CreateModalParameters } from '../../../view-models/modals/modals-types';
import { IdentityService } from '../../../services/auth/identity.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { WorkPackageService } from '../../../services/projects/work-package.service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-project-tree',
  templateUrl: './project-tree.component.html',
  styleUrls: ['./project-tree.component.scss'],
})
export class ProjectTreeComponent implements OnInit {
  @Input() model: ProjectViewModel;
  @Input() permission: AccessType;
  subProjects: SubProjectViewModel[];
  workPackages: WorkPackageViewModel[];
  reCreate = new EventEmitter<string>();
  dragDelay: number;
  AccessType = AccessType;
  noDrag: boolean;
  waiting: boolean;
  data: TreeViewModel;
  constructor(
    readonly socket: Socket,
    private readonly router: Router,
    private readonly identityService: IdentityService,
    private readonly projectService: ProjectService,
    private readonly modalService: ModalService,
    private readonly formService: FormService,
    private readonly notificationService: NotificationService,
    private readonly translateService: TranslateService,
    private readonly workPackageService: WorkPackageService,
    private readonly deviceDetectorService: DeviceDetectorService,
  ) {}

  ngOnInit() {
    this.dragDelay =
      this.deviceDetectorService.isTablet() ||
      this.deviceDetectorService.isMobile()
        ? 1000
        : 0;
    this.noDrag =
      !(
        this.permission === AccessType.Admin ||
        this.permission === AccessType.Owner
      ) || this.deviceDetectorService.os.toLowerCase() === 'ios';
    this.bind();
    this.fetch();
  }

  async fetch() {
    this.waiting = true;
    const op = await this.projectService.tree(this.model.id);
    if (op.status !== OperationResultStatus.Success) {
      // TODO: handle error
      return;
    }
    this.data = op.data;
    this.waiting = false;
    this.createTree();
  }

  bind() {
    this.socket.on('push-notification', (notification: any) => {
      switch (notification.type) {
        case ActivityType.WorkPackageAdd:
        case ActivityType.WorkPackageEdit:
        case ActivityType.ProjectAdd:
        case ActivityType.ProjectSubAdd:
        case ActivityType.ProjectSubRemove:
        case ActivityType.ProjectSubEdit:
          if (notification.data.projectId === this.model.id) {
            setTimeout(() => {
              if (this.model.template !== ProjectTemplate.Animation) {
                this.createTree();
                this.reCreate.emit();
              }
            }, 500);
          }
          break;
      }
    });
  }

  createTree(sub: SubProjectViewModel = null) {
    const subId = sub ? sub.id : null;
    this.workPackages = this.model.workPackages
      .filter((w) => w.subProjectId === subId)
      .sort((a, b) => (a.order > b.order ? 1 : -1));
    this.subProjects = this.model.subProjects
      .filter((s) => s.parentId === subId)
      .sort((a, b) => (a.order > b.order ? 1 : -1));
  }

  newSubProject(parentId?: string) {
    this.modalService
      .show(PromptComponent, {
        icon: 'icon-tree7',
        title: 'NEW_SUB_PROJECT',
        form: [
          {
            elements: [
              this.formService.createInput({
                config: { field: 'title' },
                params: { model: '', placeHolder: 'TITLE' },
                validation: {
                  required: {
                    value: true,
                    message: 'TITLE_REQUIRED',
                  },
                },
              }),
              this.formService.createInput({
                config: { field: 'description' },
                params: {
                  model: '',
                  textArea: true,
                  placeHolder: 'DESCRIPTION',
                },
              }),
            ],
          },
        ],
        action: async (params, form) => {
          if (parentId) {
            params.parentId = parentId;
          }
          const op = await this.projectService.createSubProject(
            this.model.id,
            params,
          );
          if (op.status !== OperationResultStatus.Success) {
            // TODO: handle error
            return;
          }
          this.notificationService.success('SUB_PROJECT_CREATED');
        },
        actionLabel: 'CREATE',
        actionColor: 'primary',
      } as PromptModalParameters)
      .subscribe(() => {});
  }

  newWorkPackage(parentId?: string) {
    const plan = this.identityService.profile.plan;
    if (plan.usedWorkPackage >= plan.workPackage) {
      // this.modalService
      //   .show(UpgradeComponent, {} as CreateModalParameters)
      //   .subscribe(() => {});
      return;
    }

    this.modalService
      .show(WorkPackageWizardComponent, {
        projectId: this.model.id,
        parentId,
      })
      .subscribe(() => {});
  }

  deleteSubProject(id: string) {
    const heading = StringHelpers.format(
      this.translateService.fromKey('REMOVE_SUB_CONFIRM_HEADING'),
      [this.model.subProjects.find((s) => s.id === id).title],
    );
    this.modalService
      .confirm({
        title: 'REMOVE_SUB',
        message: 'REMOVE_SUB_CONFIRM',
        heading,
        actionLabel: 'REMOVE_SUB',
        cancelLabel: 'CANCEL',
        action: async () => {
          return await this.projectService.removeSubProject(id);
        },
      })
      .subscribe((confirmed) => {});
  }

  editSubProject(id: string) {
    const sub = this.model.subProjects.find((s) => s.id === id);
    this.modalService
      .show(PromptComponent, {
        icon: 'icon-tree7',
        title: 'EDIT_SUB_PROJECT',
        form: [
          {
            elements: [
              this.formService.createInput({
                config: { field: 'title' },
                params: { model: sub.title, placeHolder: 'TITLE' },
                validation: {
                  required: {
                    value: true,
                    message: 'TITLE_REQUIRED',
                  },
                },
              }),
              this.formService.createInput({
                config: { field: 'description' },
                params: {
                  model: sub.description,
                  textArea: true,
                  placeHolder: 'DESCRIPTION',
                },
              }),
            ],
          },
        ],
        action: async (params, form) => {
          const op = await this.projectService.editSubProject(id, params);
          if (op.status !== OperationResultStatus.Success) {
            // TODO: handle error
            return;
          }
          this.notificationService.success('SUB_PROJECT_UPDATED');
        },
        actionLabel: 'SAVE_CHANGES',
        actionColor: 'primary',
      } as PromptModalParameters)
      .subscribe(() => {});
  }

  openWorkPackage(workPackage: WorkPackageViewModel) {
    this.router.navigateByUrl('/work-package/' + workPackage.id);
  }

  dropSubProject(event: CdkDragDrop<SubProjectViewModel[], any>) {
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
    event.item.data.order = event.currentIndex + 1;
    this.projectService.changeSupProjectOrder(event.item.data.id, {
      order: event.item.data.order,
    });
    this.subProjects.forEach((sub, index) => {
      sub.order = index + 1;
    });
  }

  dropWorkPackage(event: CdkDragDrop<WorkPackageViewModel[], any>) {
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
    event.item.data.order = event.currentIndex + 1;
    this.workPackageService.changeOrder(event.item.data.id, {
      order: event.item.data.order,
    });
    this.workPackages.forEach((sub, index) => {
      sub.order = index + 1;
    });
  }
}
