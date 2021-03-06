"""empty message

Revision ID: 26da869b8d3d
Revises: 166b64ae8174
Create Date: 2015-11-22 09:49:14.810000

"""

# revision identifiers, used by Alembic.
revision = '26da869b8d3d'
down_revision = '166b64ae8174'

from alembic import op
import sqlalchemy as sa
import geoalchemy2 



def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.create_table('Stream_Act',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('ath_id', sa.Integer(), nullable=True),
    sa.Column('act_id', sa.Integer(), nullable=True),
    sa.Column('last_updated_datetime_utc', sa.DateTime(), nullable=True),
    sa.Column('act_name', sa.String(length=200), nullable=True),
    sa.Column('linestring', geoalchemy2.types.Geometry(geometry_type='LINESTRING'), nullable=True),
    sa.Column('multipoint', geoalchemy2.types.Geometry(geometry_type='MULTIPOINT'), nullable=True),
    sa.ForeignKeyConstraint(['act_id'], ['Activity.act_id'], ),
    sa.ForeignKeyConstraint(['ath_id'], ['Athlete.ath_id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_Stream_Act_act_id'), 'Stream_Act', ['act_id'], unique=False)
    op.create_index(op.f('ix_Stream_Act_ath_id'), 'Stream_Act', ['ath_id'], unique=False)
    op.create_index(op.f('ix_Stream_Act_linestring'), 'Stream_Act', ['linestring'], unique=False)
    op.create_index(op.f('ix_Stream_Act_multipoint'), 'Stream_Act', ['multipoint'], unique=False)
    #op.drop_table('spatial_ref_sys')
    #op.create_index(op.f('ix_Stream_point'), 'Stream', ['point'], unique=False)
    #op.drop_index('idx_Stream_point', table_name='Stream')
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    #op.create_index('idx_Stream_point', 'Stream', ['point'], unique=False)
    #op.drop_index(op.f('ix_Stream_point'), table_name='Stream')
    """op.create_table('spatial_ref_sys',
    sa.Column('srid', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('auth_name', sa.VARCHAR(length=256), autoincrement=False, nullable=True),
    sa.Column('auth_srid', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('srtext', sa.VARCHAR(length=2048), autoincrement=False, nullable=True),
    sa.Column('proj4text', sa.VARCHAR(length=2048), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('srid', name=u'spatial_ref_sys_pkey')
    )"""
    op.drop_index(op.f('ix_Stream_Act_multipoint'), table_name='Stream_Act')
    op.drop_index(op.f('ix_Stream_Act_linestring'), table_name='Stream_Act')
    op.drop_index(op.f('ix_Stream_Act_ath_id'), table_name='Stream_Act')
    op.drop_index(op.f('ix_Stream_Act_act_id'), table_name='Stream_Act')
    op.drop_table('Stream_Act')
    ### end Alembic commands ###
