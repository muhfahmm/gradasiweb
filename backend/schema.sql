CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    link VARCHAR(255),
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some dummy data
INSERT INTO projects (title, description, image_url, link, category) VALUES
('Company Profile', 'Modern company profile website for a law firm.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', '#', 'Web Development'),
('E-Commerce App', 'Full-featured online store with payment integration.', 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80', '#', 'Mobile App'),
('Landing Page', 'High-converting landing page for a SaaS product.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', '#', 'UI/UX Design');

-- Table for Admin Login
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial admin (password: admin123)
INSERT INTO admins (username, password) VALUES ('admin', 'admin123');

