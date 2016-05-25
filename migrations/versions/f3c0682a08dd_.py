"""empty message

Revision ID: f3c0682a08dd
Revises: 83c5499c55ed
Create Date: 2016-05-24 07:57:32.946000

"""

# revision identifiers, used by Alembic.
revision = 'f3c0682a08dd'
down_revision = '83c5499c55ed'

from alembic import op
import sqlalchemy as sa
import geoalchemy2 
from sqlalchemy_utils import URLType

from sqlalchemy.dialects import postgresql

def upgrade():
    ### commands auto generated by Alembic - please adjust! ###

    op.alter_column('Activity', 'id',
               existing_type=sa.INTEGER(),
               nullable=True,
               existing_server_default=sa.text(u'nextval(\'"Activity_id_seq"\'::regclass)'))
    op.create_index(op.f('ix_Activity_act_start_point'), 'Activity', ['act_start_point'], unique=False)
    op.alter_column('Athlete', 'id',
               existing_type=sa.INTEGER(),
               nullable=True,
               existing_server_default=sa.text(u'nextval(\'"Athlete_id_seq"\'::regclass)'))
    '''
    op.drop_index('idx_Segment_end_point', table_name='Segment')
    op.drop_index('idx_Segment_start_point', table_name='Segment')
    op.drop_index('ix_Segment_act_type', table_name='Segment')
    op.drop_index('ix_Segment_cat', table_name='Segment')
    op.drop_index('ix_Segment_date_created', table_name='Segment')
    op.drop_index('ix_Segment_elev_gain', table_name='Segment')
    op.alter_column('Stream', 'act_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.create_index(op.f('ix_Stream_act_id'), 'Stream', ['act_id'], unique=False)
    op.create_index(op.f('ix_Stream_point'), 'Stream', ['point'], unique=False)
    op.drop_index('idx_Stream_point', table_name='Stream')'''
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    
    '''
    op.create_index('idx_Stream_point', 'Stream', ['point'], unique=False)
    op.drop_index(op.f('ix_Stream_point'), table_name='Stream')
    op.drop_index(op.f('ix_Stream_act_id'), table_name='Stream')
    op.alter_column('Stream', 'act_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    '''
    op.create_index('ix_Segment_start_point', 'Segment', ['start_point'], unique=False)
    op.create_index('ix_Segment_end_point', 'Segment', ['end_point'], unique=False)
    op.create_index('ix_Segment_elev_gain', 'Segment', ['elev_gain'], unique=False)
    op.create_index('ix_Segment_date_created', 'Segment', ['date_created'], unique=False)
    op.create_index('ix_Segment_cat', 'Segment', ['cat'], unique=False)
    op.create_index('ix_Segment_act_type', 'Segment', ['act_type'], unique=False)
    op.create_index('idx_Segment_start_point', 'Segment', ['start_point'], unique=False)
    op.create_index('idx_Segment_end_point', 'Segment', ['end_point'], unique=False)
    '''
    op.alter_column('Athlete', 'id',
               existing_type=sa.INTEGER(),
               nullable=False,
               existing_server_default=sa.text(u'nextval(\'"Athlete_id_seq"\'::regclass)'))
    op.drop_index(op.f('ix_Activity_act_start_point'), table_name='Activity')
    op.alter_column('Activity', 'id',
               existing_type=sa.INTEGER(),
               nullable=False,
               existing_server_default=sa.text(u'nextval(\'"Activity_id_seq"\'::regclass)'))

    op.create_table('spatial_ref_sys',
    sa.Column('srid', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('auth_name', sa.VARCHAR(length=256), autoincrement=False, nullable=True),
    sa.Column('auth_srid', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('srtext', sa.VARCHAR(length=2048), autoincrement=False, nullable=True),
    sa.Column('proj4text', sa.VARCHAR(length=2048), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('srid', name=u'spatial_ref_sys_pkey')
    )
    op.create_table('Stream_LineString',
    sa.Column('ath_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('act_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('act_name', sa.VARCHAR(length=200), autoincrement=False, nullable=True),
    sa.Column('act_type', sa.VARCHAR(length=20), autoincrement=False, nullable=True),
    sa.Column('linestring', geoalchemy2.types.Geometry(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['act_id'], [u'Activity.act_id'], name=u'Act id fk'),
    sa.PrimaryKeyConstraint('act_id', name=u'act_id_pk')
    )
    op.create_table('Stream_HeatPoint',
    sa.Column('ath_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('point', geoalchemy2.types.Geometry(), autoincrement=False, nullable=True),
    sa.Column('density', postgresql.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.Column('speed', postgresql.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.Column('grade', postgresql.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.Column('power', postgresql.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.Column('hr', postgresql.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.Column('cadence', postgresql.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['ath_id'], [u'Athlete.ath_id'], name=u'ath_id FK')
    )
    '''
    ### end Alembic commands ###