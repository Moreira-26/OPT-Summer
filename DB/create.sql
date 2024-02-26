DROP SCHEMA IF EXISTS public CASCADE;

create schema if not exists public;

----------------------------------
--TABLES
----------------------------------


CREATE TABLE nodes_version(
	id SERIAL PRIMARY KEY,
	name VARCHAR(255),
	short_name VARCHAR(255),
	latitude VARCHAR(255),
	longitude VARCHAR(255),
	label_pos CHAR(1),
	visible BOOL,
	is_depot BOOL,
	version INTEGER
);

CREATE TABLE segment_type(
	id SERIAL PRIMARY KEY,
	name VARCHAR(255),
	empty BOOL
);

CREATE TABLE segment_version(
	id SERIAL PRIMARY KEY,
	name VARCHAR(255),
	start_node_id INTEGER REFERENCES nodes_version(id),
	end_node_id INTEGER REFERENCES nodes_version(id),
	segment_type INTEGER REFERENCES segment_type(id),
	default_length INTEGER,
	average_duration INTEGER,
	visible BOOL
);

CREATE TABLE paths_version(
	id SERIAL PRIMARY KEY,
	name VARCHAR(255),
	empty BOOL, 
	type_value INTEGER,
	old_type_value INTEGER
);

CREATE TABLE paths_segs(
	id SERIAL PRIMARY KEY,
	seg_id INTEGER REFERENCES segment_version(id),
	path_version_id INTEGER REFERENCES paths_version(id),
	length INTEGER,
	ptsg_order INTEGER
);

CREATE TABLE lines_version(
	id SERIAL PRIMARY KEY,
	name VARCHAR(255),
	active BOOL,
	color INTEGER
);

CREATE TABLE lines_paths(
	line_id INTEGER REFERENCES lines_version(id),
	path_id INTEGER REFERENCES paths_version(id),
	id SERIAL PRIMARY KEY,
	orientation INTEGER,
	internal BOOL
);

CREATE TABLE gistlines_version(
	id SERIAL PRIMARY KEY,
	name VARCHAR(255),
	active BOOL
);

CREATE TABLE gistlines_lines(
	gline_version_id INTEGER REFERENCES gistlines_version(id),
	line_id INTEGER REFERENCES lines_version(id),
	PRIMARY KEY(gline_version_id,line_id)
);

CREATE TABLE nodes_status(
	id SERIAL PRIMARY KEY,
	name VARCHAR(255),
	depot BOOL,
	relief_point BOOL
);

CREATE TABLE glines_node_status(
	id SERIAL PRIMARY KEY,
	gline_version_id INTEGER REFERENCES gistlines_version(id),
	node_id INTEGER REFERENCES nodes_version(id),
	node_status_id INTEGER REFERENCES nodes_status(id)
);

CREATE TABLE glines_paths(
	gline_version_id INTEGER REFERENCES gistlines_version(id),
	path_id INTEGER REFERENCES paths_version(id),
	orientation INTEGER,
	id SERIAL PRIMARY KEY
);

CREATE TABLE stops_version(
	id SERIAL PRIMARY KEY,
	name VARCHAR(255),
	short_name VARCHAR(255),
	latitude VARCHAR(255),
	longitude VARCHAR(255),
	label_pos CHAR(1),
	visible BOOL,
	active BOOL,
	code VARCHAR(255)
);

CREATE TABLE tracks_version(
	id SERIAL PRIMARY KEY,
	name VARCHAR(255),
	start_stop INTEGER REFERENCES stops_version(id),
	end_stop INTEGER REFERENCES stops_version(id),
	visible BOOL,
	length INTEGER
);

CREATE TABLE path_segs_tracks(
	path_seg_version_id INTEGER REFERENCES paths_segs(id),
	track_id INTEGER REFERENCES tracks_version(id),
	setr_order INTEGER,
	PRIMARY KEY(path_seg_version_id ,track_id)
);

CREATE TABLE day_types(
	id SERIAL PRIMARY KEY,
	name VARCHAR(255),
	rule VARCHAR(255),
	short_name VARCHAR(255),
	priority INTEGER,
	dt_rule VARCHAR(255),
	active BOOL
);

CREATE TABLE year_seasons(
	id SERIAL PRIMARY KEY,
	name VARCHAR(255),
	short_name VARCHAR(255),
	priority INTEGER,
	active BOOL
);

CREATE TABLE planning_schedules(
	id SERIAL PRIMARY KEY,
	gistline_id INTEGER REFERENCES gistlines_version(id),
	year_season_id INTEGER REFERENCES year_seasons(id),
	day_type_id INTEGER REFERENCES day_types(id),
	version VARCHAR(255),
	active BOOL
);

CREATE TABLE trips(
	id SERIAL PRIMARY KEY,
	path_id INTEGER REFERENCES paths_version(id),
	line_id INTEGER REFERENCES lines_version(id),
	start_node_id INTEGER REFERENCES nodes_version(id),
	start_time INTEGER,
	end_node_id INTEGER REFERENCES nodes_version(id),
	end_time INTEGER,
	empty BOOL,
	orientation CHAR,
	schedule_id INTEGER REFERENCES planning_schedules(id)
);

CREATE TABLE trips_schedules(
	planning_schedule_id INTEGER REFERENCES planning_schedules(id),
	trip_id INTEGER REFERENCES trips(id),
	PRIMARY KEY(planning_schedule_id, trip_id)
);

CREATE TABLE work_blocks(
	id SERIAL PRIMARY KEY,
	active BOOL,
	start_time INTEGER,
	end_time INTEGER,
	start_node_id INTEGER REFERENCES nodes_version(id),
	end_node_id INTEGER REFERENCES nodes_version(id),
	type VARCHAR(3),
	schedule_id INTEGER REFERENCES planning_schedules(id)
);

CREATE TABLE vehicle_duties(
	id SERIAL PRIMARY KEY,
	code INTEGER,
	color INTEGER,
	depots INTEGER,
	schedule_id INTEGER REFERENCES planning_schedules(id)
);

CREATE TABLE trips_schd_work_blocks(
	id SERIAL PRIMARY KEY,
	is_denied BOOL,
	trip_id INTEGER REFERENCES trips(id),
	work_block_id INTEGER REFERENCES work_blocks(id),
	schedule_id INTEGER REFERENCES planning_schedules(id)
);

CREATE TABLE vehcl_duties_schd_work_blocks(
	id SERIAL PRIMARY KEY,
	is_denied BOOL,
	vehicle_duty_id INTEGER REFERENCES vehicle_duties(id),
	work_block_id INTEGER REFERENCES work_blocks(id),
	schedule_id INTEGER REFERENCES 	planning_schedules(id)
);

