declare namespace Api {
  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
    }

    interface RoleInfo {
      Id: string;
      Code: string;
      Name: string;
    }

    interface DepartmentInfo {
      Id: string;
      Code: string;
      Name: string;
    }

    interface UserInfo {
      Id: string;
      ITCode: string;
      Name: string;
      PhotoId?: string;
      IsSuperUser: boolean;
      Roles: RoleInfo[];
      Departments: DepartmentInfo[];
      TimeTick: number;
    }
  }
}
