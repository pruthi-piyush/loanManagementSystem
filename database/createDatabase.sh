#!/bin/sh

psql -U postgres -d postgres -c 'create database redcarpet_db;' 
psql -U postgres -d postgres -c "create user redcarpet with encrypted password 'admin123';"
psql -U postgres -d postgres -c 'grant all privileges on database redcarpet_db to redcarpet;'

echo 'Creating database patches'
psql -U redcarpet -d redcarpet_db -f database_baseline.sql

