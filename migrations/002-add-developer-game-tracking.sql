-- 사용자 테이블에 개발자 기능 추가
ALTER TABLE users ADD COLUMN is_developer BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD INDEX idx_users_developer (is_developer);

-- 게임 테이블 개선 (핵심 컬럼만)
ALTER TABLE games ADD COLUMN developer_id VARCHAR(36) NOT NULL;
ALTER TABLE games ADD COLUMN price_per_second DECIMAL(10,8) DEFAULT 0.00000001;
ALTER TABLE games ADD COLUMN total_sessions INT DEFAULT 0;
ALTER TABLE games ADD COLUMN approval_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING';
ALTER TABLE games ADD INDEX idx_games_developer (developer_id);
ALTER TABLE games ADD INDEX idx_games_approval (approval_status);
ALTER TABLE games ADD FOREIGN KEY (developer_id) REFERENCES users(id);

-- 플레이 세션 테이블 대폭 개선
ALTER TABLE play_sessions ADD COLUMN developer_id VARCHAR(36) NOT NULL;
ALTER TABLE play_sessions ADD COLUMN started_at DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE play_sessions ADD COLUMN ended_at DATETIME NULL;
ALTER TABLE play_sessions ADD COLUMN active_play_time INT DEFAULT 0;
ALTER TABLE play_sessions ADD COLUMN cost_per_second DECIMAL(10,8);
ALTER TABLE play_sessions ADD COLUMN total_cost DECIMAL(18,6) DEFAULT 0;
ALTER TABLE play_sessions ADD COLUMN heartbeat_count INT DEFAULT 0;

ALTER TABLE play_sessions ADD INDEX idx_play_sessions_developer (developer_id);
ALTER TABLE play_sessions ADD INDEX idx_play_sessions_time (started_at, ended_at);
ALTER TABLE play_sessions ADD FOREIGN KEY (developer_id) REFERENCES users(id);

-- 개발자 일일 통계 테이블 (최소화)
CREATE TABLE developer_stats (
  id VARCHAR(36) PRIMARY KEY,
  developer_id VARCHAR(36) NOT NULL,
  game_id VARCHAR(36),
  date DATE NOT NULL,
  daily_revenue DECIMAL(18,6) DEFAULT 0,
  daily_sessions INT DEFAULT 0,
  daily_players INT DEFAULT 0,
  daily_play_time INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (developer_id) REFERENCES users(id),
  FOREIGN KEY (game_id) REFERENCES games(id),
  UNIQUE KEY uk_developer_stats (developer_id, game_id, date),
  INDEX idx_developer_stats_date (date)
);