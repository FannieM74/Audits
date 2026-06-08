CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    plant_no TEXT NOT NULL,
    site TEXT NOT NULL
);

INSERT INTO businesses (name, plant_no, site) VALUES
    ('Germiston Wheels', '1408', 'Germiston'),
    ('Germiston Wagons', '1407', 'Germiston');
