var UserInfo = function(name, postUrl, freeeEmployeeId, defaultProject) {
  this.name = name;
  this.postUrl = postUrl;
  this.freeeEmployeeId = freeeEmployeeId;
  this.defaultProject = defaultProject;
};

const userList = [
  new UserInfo('User1', 'https://hoge', '12345', '@@ prj1 @@'),
  new UserInfo('User2', 'https://hoge', '12345', '@@ prj2 @@')
];