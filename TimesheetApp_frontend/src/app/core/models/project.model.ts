export interface Project {
  projectId: number;
  projectName: string;
  clientName?: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProjectCreateRequest {
  projectName: string;
  clientName?: string;
  description?: string;
  startDate: string;
  endDate?: string;
}

export interface ProjectUpdateRequest {
  projectName: string;
  clientName?: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}
