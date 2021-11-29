create table if not exists pman.user (
  userID int unsigned not null AUTO_INCREMENT,
  userCreatedAt timestamp not null default current_timestamp,
  userProfileName varchar(64) not null,
  userProfileImgDefault varchar(2083) not null,
  userProfileImg varchar(2083) null,
  userAccountID varchar(255) not null,
  userAccountType int unsigned not null default 0,
  userBlocked int unsigned not null default 0,
  primary key (userID)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

create table if not exists pman.team (
  teamID int unsigned not null AUTO_INCREMENT,
  teamOwnerUserID int unsigned not null,
  teamCreatedAt timestamp not null default current_timestamp,
  teamProfileName varchar(128) not null,
  teamProfileDescription TEXT null,
  teamProfileImg varchar(2083) null,
  teamInviteCount int unsigned not null default 0,
  teamInviteLatestAt timestamp null,
  foreign key (teamOwnerUserID) references user(userID) on update cascade,
  primary key (teamID)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

create table if not exists pman.teamMember (
  teamJoinedAt timestamp not null default current_timestamp,
  teamPermission int unsigned not null default 0,
  teamID int unsigned not null,
  userID int unsigned not null,
  foreign key (teamID) references team(teamID) on delete cascade on update cascade,
  foreign key (userID) references user(userID) on delete cascade on update cascade,
  primary key (teamID, userID)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

create table if not exists pman.teamSchedule (
  scheduleID int unsigned not null AUTO_INCREMENT,
  scheduleOwnerUserID int unsigned not null,
  scheduleName varchar(255) not null,
  schedulePublishAt timestamp not null,
  scheduleExpiryAt timestamp not null,
  scheduleReversion int unsigned not null default 0,
  scheduleTag int unsigned not null default 0,
  scheduleContent LONGTEXT not null default '',
  teamID int unsigned not null,
  foreign key (teamID, scheduleOwnerUserID) references teamMember(teamID, userID) on delete cascade on update cascade,
  primary key (scheduleID, teamID)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

create table if not exists pman.teamScheduleFile (
  scheduleFile varchar(2083) not null,
  scheduleFileName varchar(2083) not null,
  scheduleFileThumbnail BLOB null,
  scheduleID int unsigned not null,
  teamID int unsigned not null,
  foreign key (scheduleID, teamID) references teamSchedule(scheduleID, teamID) on delete cascade on update cascade
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

create table if not exists pman.teamScheduleReference (
  scheduleReferenceID int unsigned not null AUTO_INCREMENT,
  scheduleReferencePublishAt timestamp null,
  scheduleReferenceTag int unsigned not null default 0,
  scheduleReferenceContent LONGTEXT not null default '',
  scheduleID int unsigned not null,
  teamID int unsigned not null,
  userID int unsigned not null,
  foreign key (scheduleID, teamID) references teamSchedule(scheduleID, teamID) on delete cascade on update cascade,
  foreign key (teamID, userID) references teamMember(teamID, userID) on delete cascade on update cascade,
  primary key (scheduleReferenceID, scheduleID, teamID)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

create table if not exists pman.teamScheduleReferenceFile (
  scheduleReferenceFile varchar(2083) not null,
  scheduleReferenceID int unsigned not null,
  scheduleID int unsigned not null,
  teamID int unsigned not null,
  foreign key (scheduleReferenceID, scheduleID, teamID) references teamScheduleReference(scheduleReferenceID, scheduleID, teamID) on delete cascade on update cascade
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;




create table if not exists pman.teamFiles (
  fileUUID char(36) not null,
  fileName varchar(2083) not null,
  fileExtname varchar(255) null,
  fileThumbnail BLOB null,
  primary key (fileUUID)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

create table if not exists pman.teamSchedule (
  teamID int unsigned not null,
  scheduleID int unsigned not null AUTO_INCREMENT,
  scheduleName varchar(255) not null,
  scheduleModifyAt timestamp not null default current_timestamp on update current_timestamp,
  schedulePublishAt timestamp not null,
  scheduleExpiryAt timestamp not null,
  scheduleReversion int unsigned not null default 0,
  scheduleContent LONGTEXT not null default '',
  scheduleType int unsigned not null default 0,
  fileUUID char(36) null,
  userID int unsigned not null,
  foreign key (teamID, userID) references teamMember(teamID, userID) on delete cascade on update cascade,
  foreign key (fileUUID) references teamFiles(fileUUID) on delete set null on update cascade,
  primary key (scheduleID, teamID)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

create table if not exists pman.teamScheduleWhitelist (
  teamID int unsigned not null,
  scheduleID int unsigned not null,
  userID int unsigned not null,
  foreign key (scheduleID, teamID) references teamSchedule(scheduleID, teamID) on delete cascade on update cascade,
  foreign key (teamID, userID) references teamMember(teamID, userID) on delete cascade on update cascade,
  unique (teamID, scheduleID, userID)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

create table if not exists pman.teamScheduleSubmit (
  teamID int unsigned not null,
  scheduleID int unsigned not null,
  userID int unsigned not null,
  submitID int unsigned not null AUTO_INCREMENT,
  submitPublishAt timestamp not null default current_timestamp,
  submitModifiedAt timestamp not null default current_timestamp on update current_timestamp,
  submitContent LONGTEXT not null,
  fileUUID char(36) null,
  foreign key (teamID, scheduleID, userID) references teamScheduleWhitelist(teamID, scheduleID, userID) on delete cascade on update cascade,
  foreign key (fileUUID) references teamFiles(fileUUID) on delete set null on update cascade,
  unique (teamID, scheduleID, userID),
  primary key(submitID)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

create table if not exists pman.teamScheduleComment (
  teamID int unsigned not null,
  scheduleID int unsigned not null,
  userID int unsigned not null,
  commentID int unsigned not null AUTO_INCREMENT,
  commentCreatedAt timestamp not null default current_timestamp,
  commentModifiedAt timestamp not null default current_timestamp on update current_timestamp,
  commentContent LONGTEXT not null,
  foreign key (teamID, userID) references teamMember(teamID, userID) on delete cascade on update cascade,
  foreign key (scheduleID, teamID) references teamSchedule(scheduleID, teamID) on delete cascade on update cascade,
  primary key(commentID)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;


create table if not exists pman.teamWiki (
  wikiID int unsigned not null AUTO_INCREMENT,
  teamID int unsigned not null,
  createdAt timestamp not null default current_timestamp,
  modifiedAt timestamp not null default current_timestamp on update current_timestamp,
  wikiTitle varchar(256) not null,
  wikiContent LONGTEXT not null,
  foreign key (teamID) references team(teamID) on delete cascade on update cascade,
  primary key (wikiID)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

create table if not exists pman.teamWebhook (
  teamID int unsigned not null AUTO_INCREMENT,
  webhookURL varchar(2083) not null,
  foreign key (teamID) references team(teamID) on update cascade,
  unique (teamID)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

create table if not exists pman.teamScheduleStatus (
  teamID int unsigned not null,
  scheduleID int unsigned not null,
  userID int unsigned not null,
  createdAt timestamp not null default current_timestamp,
  modifiedAt timestamp not null default current_timestamp on update current_timestamp,
  statusContent varchar(255) not null,
  fileUUID char(36) null,
  foreign key (teamID, scheduleID, userID) references teamScheduleWhitelist(teamID, scheduleID, userID) on delete cascade on update cascade,
  foreign key (fileUUID) references teamFiles(fileUUID) on delete set null on update cascade,
  unique (teamID, scheduleID, userID)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;




--- query test

insert into user(
  userProfileName,
  userProfileImgDefault,
  userAccountID
) values (
  'test2',
  '/dummy',
  '64'
);

insert into teamMember(
  teamID,
  userID
) values (
  2, 3
);

update teamScheduleReference set teamScheduleReference.userID=3 where teamScheduleReference.userID=4;

insert into teamSchedule(
  scheduleOwnerUserID,
  schedulePublishAt,
  scheduleExpiryAt,
  teamID
) values (
  1,
  current_timestamp,
  current_timestamp,
  1
);

insert into teamScheduleReference(
  scheduleID, userID
) values (
  8, 2
);
