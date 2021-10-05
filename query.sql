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
