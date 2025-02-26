interface NavigatorPagination {
  offset: number;
  pageSize: number;
  total: number;
}

export interface MenuReferenceData {
  id: string;
  name: string;
  type: string;
  root: string;
  path: string;
}

export interface MenuData {
  restaurant: {
    pathRef: string;
  };
  meal: string;
}

export interface MenuResultData {
  id: string;
  name: string;
  type: string;
  root: string;
  state: string;
  path: string;
  data: MenuData;
  references: {
    [key: string]: MenuReferenceData;
  };
}

export interface MenusResponseData {
  type: string;
  root: string;
  page: NavigatorPagination;
  results: MenuResultData[];
}
