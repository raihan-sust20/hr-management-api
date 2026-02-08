CREATE TABLE hr_users (
  id              SERIAL PRIMARY KEY,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  name            VARCHAR(255) NOT NULL,
  created_at      TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

CREATE TRIGGER update_hr_users_updated_at
  BEFORE UPDATE ON hr_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE employees (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  age             INTEGER NOT NULL CHECK (age >= 18 AND age <= 70),
  designation     VARCHAR(255) NOT NULL,
  hiring_date     DATE NOT NULL,
  date_of_birth   DATE NOT NULL,
  salary          DECIMAL(10, 2) NOT NULL,
  photo_path      VARCHAR(500) NULL,
  created_at      TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_employees_name ON employees(name);

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE attendance (
  id              SERIAL PRIMARY KEY,
  employee_id     INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  check_in_time   TIMESTAMP NOT NULL,
  
  CONSTRAINT uq_attendance_employee_date UNIQUE (employee_id, date)
);

CREATE INDEX idx_attendance_date ON attendance(date);
