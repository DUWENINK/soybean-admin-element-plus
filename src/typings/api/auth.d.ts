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
      id: string;
      code: string;
      name: string;
    }

    interface DepartmentInfo {
      id: string;
      code: string;
      name: string;
    }

    interface UserInfo {
      id: string;
      itCode: string;
      name: string;
      photoId?: string;
      isSuperUser: boolean;
      roles: RoleInfo[];
      departments: DepartmentInfo[];
      timeTick: number;
    }
  }
}
