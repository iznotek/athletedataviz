"""empty message

Revision ID: 4405fa1df685
Revises: 512b208efe83
Create Date: 2015-10-25 18:10:42.422000

"""

# revision identifiers, used by Alembic.
revision = '4405fa1df685'
down_revision = '512b208efe83'

from alembic import op
import sqlalchemy as sa
import geoalchemy2


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        table_name='Athlete',
        column_name='api_code',
        nullable=True,
        type_=sa.String(length=50)
    )
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    """
    op.create_index('idx_Stream_point', 'Stream', ['point'], unique=False)
    op.create_table('spatial_ref_sys',
    sa.Column('srid', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('auth_name', sa.VARCHAR(length=256), autoincrement=False, nullable=True),
    sa.Column('auth_srid', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('srtext', sa.VARCHAR(length=2048), autoincrement=False, nullable=True),
    sa.Column('proj4text', sa.VARCHAR(length=2048), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('srid', name=u'spatial_ref_sys_pkey')
    )
    """
    ### end Alembic commands ###
    return None
