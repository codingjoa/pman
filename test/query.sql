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

create table if not exists pman.group (
  groupID int unsigned not null AUTO_INCREMENT,
  groupOwnerUserID int unsigned not null,
  groupCreatedAt timestamp not null default current_timestamp,
  groupProfileName varchar(128) not null,
  groupProfileDescription TEXT null,
  groupProfileImg varchar(2083) null,
  groupInviteCount int unsigned not null default 0,
  foreign key (groupOwnerUserID) references user(userID) on update cascade,
  primary key (groupID)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

create table if not exists pman.groupMember (
  groupID int unsigned not null,
  userID int unsigned not null,
  groupPermission int unsigned not null default 0,
  foreign key (groupID) references group(groupID) on delete cascade on update cascade,
  foreign key (userID) references user(userID) on delete cascade on update cascade,
  primary key (groupID, userID)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

create table if not exists pman.groupSchedule (
  scheduleID int unsigned not null AUTO_INCREMENT,
  scheduleOwnerUserID int unsigned not null,
  schedulePublishAt timestamp not null,
  scheduleExpiryAt timestamp not null,
  scheduleReversion int unsigned not null default 0,
  scheduleTag int unsigned not null default 0,
  scheduleContent LONGTEXT not null default '',
  groupID int unsigned not null,
  foreign key (groupID) references group(groupID) on delete cascade on update cascade,
  foreign key (scheduleOwnerUserID) references groupMember(userID) on update cascade
  primary key (scheduleID)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

create table if not exists pman.groupScheduleFile (
  scheduleFile varchar(2083) not null,
  scheduleID,
  foreign key (scheduleID) references groupSchedule(scheduleID) on delete cascade on update cascade
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

create table if not exists pman.groupScheduleReference (
  scheduleReferenceID int unsigned not null AUTO_INCREMENT,
  scheduleReferencePublishAt timestamp null,
  scheduleReferenceTag int unsigned not null default 0,
  scheduleReferenceContent LONGTEXT not null default '',
  scheduleID,
  userID,
  foreign key (scheduleID) references groupSchedule(scheduleID) on delete cascade on update cascade,
  foreign key (userID) references groupMember(userID) on delete cascade on update cascade,
  primary key (scheduleReferenceID)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

create table if not exists pman.groupScheduleReferenceFile (
  scheduleReferenceFile varchar(2083) not null,
  scheduleReferenceID,
  foreign key (scheduleReferenceID) references groupScheduleReference(scheduleReferenceID) on delete cascade on update cascade
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;
