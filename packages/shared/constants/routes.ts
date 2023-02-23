export enum APIRoutes {
  TAGS = "/api/tags",
  USERS = "/api/users",
  LOGIN = "/api/users/login",
  LOGOUT = "/api/users/logout",
  ME = "/api/users/me",
  PROJECTS = "/api/projects",
  PROJECT = "/api/projects/:slug",
  COMMENTS = "/api/projects/:slug/comments",
}

export enum ClientRoutes {
  HOME = "/",
  LOGIN = "/login",
  REGISTER = "/register",
  SETTINGS = "/settings",
  READING_LIST = "/reading-list",
  TAGS = "/tags",
  TAG = "/tags/:tag",
  PROJECT = "/projects/:slug",
  NEW_PROJECT = "/projects/new",
  MY_PROJECTS = "/projects/my-projects",
}
