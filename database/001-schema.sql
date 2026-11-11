-- MariaDB 11.4. Seleccionar la base jme antes de ejecutar.
CREATE TABLE IF NOT EXISTS users (
 id VARCHAR(64) PRIMARY KEY, email VARCHAR(190) NOT NULL UNIQUE,
 password_hash VARCHAR(255) NOT NULL, role VARCHAR(40) NOT NULL,
 status VARCHAR(20) NOT NULL, payload JSON NOT NULL
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS sessions (
 token_hash CHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL,
 expires_at DATETIME NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS clients (
 id VARCHAR(64) PRIMARY KEY, code VARCHAR(64) NOT NULL UNIQUE,
 nit VARCHAR(40) NOT NULL UNIQUE, name VARCHAR(190) NOT NULL,
 payload JSON NOT NULL
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS credits (
 id VARCHAR(64) PRIMARY KEY, client_id VARCHAR(64) NOT NULL,
 principal_cents BIGINT NOT NULL, balance_cents BIGINT NOT NULL,
 days_overdue INT NOT NULL DEFAULT 0, segment VARCHAR(64) NOT NULL,
 CHECK(principal_cents >= 0), CHECK(balance_cents >= 0), CHECK(days_overdue >= 0),
 FOREIGN KEY(client_id) REFERENCES clients(id), UNIQUE KEY uq_credit_client(client_id)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS agreements (
 id VARCHAR(64) PRIMARY KEY, client_id VARCHAR(64) NOT NULL,
 amount_cents BIGINT NOT NULL, payload JSON NOT NULL,
 CHECK(amount_cents > 0), FOREIGN KEY(client_id) REFERENCES clients(id)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS installments (
 agreement_id VARCHAR(64) NOT NULL, number INT NOT NULL,
 due_date DATE NOT NULL, amount_cents BIGINT NOT NULL, paid_cents BIGINT NOT NULL DEFAULT 0,
 PRIMARY KEY(agreement_id,number), FOREIGN KEY(agreement_id) REFERENCES agreements(id),
 CHECK(amount_cents > 0), CHECK(paid_cents >= 0 AND paid_cents <= amount_cents)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS payments (
 id VARCHAR(64) PRIMARY KEY, credit_id VARCHAR(64) NOT NULL,
 agreement_id VARCHAR(64), amount_cents BIGINT NOT NULL,
 reference VARCHAR(190) NOT NULL UNIQUE, paid_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 created_by VARCHAR(64) NOT NULL, CHECK(amount_cents > 0),
 FOREIGN KEY(credit_id) REFERENCES credits(id), FOREIGN KEY(agreement_id) REFERENCES agreements(id),
 FOREIGN KEY(created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS activities (
 id VARCHAR(64) PRIMARY KEY, client_id VARCHAR(64) NOT NULL,
 collector_id VARCHAR(64) NOT NULL, payload JSON NOT NULL,
 FOREIGN KEY(client_id) REFERENCES clients(id), FOREIGN KEY(collector_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS alerts (
 id VARCHAR(64) PRIMARY KEY, client_id VARCHAR(64) NOT NULL,
 status VARCHAR(20) NOT NULL, rule_key VARCHAR(100) NOT NULL UNIQUE,
 payload JSON NOT NULL, FOREIGN KEY(client_id) REFERENCES clients(id)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS notification_outbox (
 id VARCHAR(64) PRIMARY KEY, alert_id VARCHAR(64) NOT NULL UNIQUE,
 channel VARCHAR(30) NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(alert_id) REFERENCES alerts(id)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS audit_log (
 id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64), action VARCHAR(100) NOT NULL,
 entity_id VARCHAR(64) NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
