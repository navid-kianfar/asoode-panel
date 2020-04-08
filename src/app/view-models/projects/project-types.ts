import { BaseViewModel } from '../core/general-types';
import {
  AccessType,
  BoardTemplate,
  WorkPackageCommentPermission,
} from '../../library/app/enums';
import { MemberInfoViewModel } from '../auth/identity-types';
import {PendingInvitationViewModel} from '../groups/group-types';

export interface ProjectObjectiveEstimatedPriceViewModel {
  date: Date;
  time: number;
  amount: number;
  user: string;
  group: string;
}
export interface WorkPackageObjectiveViewModel extends BaseViewModel {
  title: string;
  description: string;
  workPackage: string;
}

export interface ProjectTemplateViewModel extends BaseViewModel {
  title: string;
  description: string;
  image: string;
  icon: string;
  seasons: ProjectSeasonViewModel[];
  subProjects: SubProjectViewModel[];
  workPackages: WorkPackageViewModel[];
}

export interface ProjectViewModel extends BaseViewModel {
  userId: string;
  title: string;
  description: string;
  premium: boolean;
  complex: boolean;
  tasks: number;
  membersCapacity: number;
  membersUsed: number;
  diskSpaceCapacity: number;
  diskSpaceUsed: number;
  pending: PendingInvitationViewModel[];
  members: ProjectMemberViewModel[];
  seasons: ProjectSeasonViewModel[];
  subProjects: SubProjectViewModel[];
  workPackages: WorkPackageViewModel[];
}
export interface ProjectMemberViewModel extends BaseViewModel {
  isGroup: boolean;
  recordId: string;
  projectId: string;
  member: MemberInfoViewModel;
  access: AccessType;
  waiting?: boolean;
  deleting?: boolean;
}
export interface ProjectSeasonViewModel extends BaseViewModel {
  userId: string;
  projectId: string;
  title: string;
  description: string;
}
export interface SubProjectViewModel extends BaseViewModel {
  userId: string;
  projectId: string;
  parentId: string;
  title: string;
  description: string;
  level: number;
  order: number;
}
export interface WorkPackageViewModel extends BaseViewModel {
  pending: PendingInvitationViewModel[];
  progress: number;
  userId: string;
  projectId: string;
  subProjectId: string;
  title: string;
  description: string;
  beginAt?: Date;
  endAt?: Date;
  actualBeginAt?: Date;
  actualEndAt?: Date;
  archivedAt?: Date;
  color: string;
  darkColor: boolean;
  commentPermission: WorkPackageCommentPermission;
  allowAttachment: boolean;
  allowBlockingBoardTasks: boolean;
  allowComments: boolean;
  allowCustomField: boolean;
  allowEndAt: boolean;
  allowEstimatedTime: boolean;
  allowGeoLocation: boolean;
  allowLabels: boolean;
  allowMembers: boolean;
  allowPoll: boolean;
  allowSegments: boolean;
  allowState: boolean;
  allowTimeSpent: boolean;
  members: WorkPackageMemberViewModel[];
  lists: WorkPackageListViewModel[];
  tasks: WorkPackageTaskViewModel[];
  objectives: WorkPackageObjectiveViewModel[];
  customFields: any[];
}
export interface WorkPackageMemberViewModel extends BaseViewModel {
  waiting?: boolean;
  recordId: string;
  packageId: string;
  access: AccessType;
  blockNotification: boolean;
  showStats: boolean;
  isGroup: boolean;
}
export interface BoardTemplateViewModel {
  type: BoardTemplate;
  icon: string;
  lists: string[];
}
export interface WorkPackageListViewModel extends BaseViewModel {
  adding?: any;
  editing?: any;
  packageId: string;
  title: string;
  color: string;
  darkColor: boolean;
  expanded?: boolean;
  order: number;
}
export interface WorkPackageTaskViewModel extends BaseViewModel {}
