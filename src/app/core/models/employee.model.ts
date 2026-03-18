export interface Employee {
  employeeId: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  dateOfJoining: string;
}

export interface EmployeeUpdateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
}

export interface EmployeeCreateRequest {
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  department: string;
  role: string;
}
