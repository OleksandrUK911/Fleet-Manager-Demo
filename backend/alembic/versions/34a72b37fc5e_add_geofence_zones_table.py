"""add_geofence_zones_table

Revision ID: 34a72b37fc5e
Revises: 9c87501a05b7
Create Date: 2026-02-27 11:47:16.877599

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '34a72b37fc5e'
down_revision: Union[str, None] = '9c87501a05b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "geofence_zones",
        sa.Column("id",          sa.Integer(),      nullable=False),
        sa.Column("name",        sa.String(),       nullable=False),
        sa.Column("latitude",    sa.Float(),        nullable=False),
        sa.Column("longitude",   sa.Float(),        nullable=False),
        sa.Column("radius_m",    sa.Float(),        nullable=False, server_default="500"),
        sa.Column("color",       sa.String(),       nullable=False, server_default="#3388ff"),
        sa.Column("description", sa.String(),       nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_geofence_zones_id", "geofence_zones", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_geofence_zones_id", table_name="geofence_zones")
    op.drop_table("geofence_zones")
