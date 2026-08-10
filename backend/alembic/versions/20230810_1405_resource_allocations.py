"""add resource_allocations table

Revision ID: 20230810_1405_resource_allocations
Revises: a68409b3d06c_initial_schema
Create Date: 2026-08-10 14:05:00.000000
"""

from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

# revision identifiers, used by Alembic.
revision = "20230810_1405"
down_revision = "355253857019"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "resource_allocations",
        sa.Column("id", pg.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("incident_id", pg.UUID(as_uuid=True), sa.ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("resource_id", pg.UUID(as_uuid=True), sa.ForeignKey("resources.id", ondelete="CASCADE"), nullable=False),
        sa.Column("assigned_by_id", pg.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=False),
        sa.Column("assigned_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("released_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="allocated"),
    )
    op.create_index("ix_resource_allocations_incident_id", "resource_allocations", ["incident_id"])
    op.create_index("ix_resource_allocations_resource_id", "resource_allocations", ["resource_id"])
    op.create_index("ix_resource_allocations_status", "resource_allocations", ["status"])


def downgrade():
    op.drop_index("ix_resource_allocations_status", table_name="resource_allocations")
    op.drop_index("ix_resource_allocations_resource_id", table_name="resource_allocations")
    op.drop_index("ix_resource_allocations_incident_id", table_name="resource_allocations")
    op.drop_table("resource_allocations")
