-- R&D Management System — MySQL schema
-- Target database: rnd_management_db

CREATE DATABASE IF NOT EXISTS rnd_management_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE rnd_management_db;

-- ---------------------------------------------------------------------------
-- User(User_ID, Name, Email, Role)
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  user_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(50)  NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Publication(Publication_ID, Title, DOI, Year, Proof)
-- Relationship: User 1:N Publications
-- ---------------------------------------------------------------------------
CREATE TABLE publications (
  publication_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  title          VARCHAR(500) NOT NULL,
  doi            VARCHAR(255),
  year           YEAR,
  proof          VARCHAR(500) COMMENT 'File path or cloud reference',
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_publications_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Patent(Patent_ID, Title, Status, Number, Document)
-- Relationship: User 1:N Patents
-- ---------------------------------------------------------------------------
CREATE TABLE patents (
  patent_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  title      VARCHAR(500) NOT NULL,
  status     VARCHAR(100) NOT NULL,
  number     VARCHAR(100),
  document   VARCHAR(500) COMMENT 'File path or cloud reference',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_patents_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Consultancy(ID, Industry, Amount, Duration)
-- Relationship: User 1:N Consultancy records
-- ---------------------------------------------------------------------------
CREATE TABLE consultancy (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  industry   VARCHAR(255) NOT NULL,
  amount     DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  duration   VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_consultancy_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Project(ID, Agency, Amount, PI, CoPI, Status)
-- Relationship: User M:N Projects (via project_users)
-- ---------------------------------------------------------------------------
CREATE TABLE projects (
  id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  agency                  VARCHAR(255) NOT NULL,
  amount                  DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  pi                      VARCHAR(255) NOT NULL COMMENT 'Principal Investigator',
  copi                    VARCHAR(255) COMMENT 'Co-Principal Investigator',
  status                  VARCHAR(100) NOT NULL,
  utilization_report_path VARCHAR(500) COMMENT 'PDF utilization report file path',
  created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE project_users (
  project_id INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NOT NULL,
  PRIMARY KEY (project_id, user_id),
  CONSTRAINT fk_project_users_project
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_project_users_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Notification(ID, User_ID, Message)
-- Relationship: User 1:N Notifications
-- ---------------------------------------------------------------------------
CREATE TABLE notifications (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  message    TEXT NOT NULL,
  is_read    TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX idx_publications_user_id ON publications (user_id);
CREATE INDEX idx_patents_user_id ON patents (user_id);
CREATE INDEX idx_consultancy_user_id ON consultancy (user_id);
CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_project_users_user_id ON project_users (user_id);
