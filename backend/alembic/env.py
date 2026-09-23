"""Alembic migration environment."""

from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.database import Base
from app.models import *  # noqa: import all models

config = context.config

# Prefer DATABASE_URL_SYNC from the environment (e.g. db host inside Docker)
import os

if os.environ.get("DATABASE_URL_SYNC"):
    config.set_main_option("sqlalchemy.url", os.environ["DATABASE_URL_SYNC"])

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# Tables owned by PostGIS / postgis_tiger_geocoder extensions — never diff or migrate them
EXTENSION_SCHEMAS = {"tiger", "tiger_data", "topology"}
EXTENSION_TABLES = {"spatial_ref_sys"}


def include_object(object_, name, type_, reflected, compare_to) -> bool:
    """Exclude PostGIS extension schemas/tables from autogenerate comparisons."""
    if type_ == "table":
        if getattr(object_, "schema", None) in EXTENSION_SCHEMAS:
            return False
        if name in EXTENSION_TABLES:
            return False
    if type_ == "index" and getattr(object_, "schema", None) in EXTENSION_SCHEMAS:
        return False
    return True


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True, dialect_opts={"paramstyle": "named"},
                      include_object=include_object)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(config.get_section(config.config_ini_section, {}), prefix="sqlalchemy.", poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata, include_object=include_object)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
