/* Create database */
DROP DATABASE IF EXISTS seacows_backend;
CREATE DATABASE seacows_backend;

DO $$
BEGIN
  IF NOT EXISTS(SELECT FROM pg_catalog.pg_roles WHERE rolname = 'seacows') THEN 
    -- Create role with password and grant the appropriate permissions to that role
    CREATE ROLE seacows WITH ENCRYPTED PASSWORD 'seacows' LOGIN;
    ALTER ROLE seacows CREATEDB;
  END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE seacows_backend to seacows;
