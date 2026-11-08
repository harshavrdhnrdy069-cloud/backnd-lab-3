-- SQLite Database Schema and Seed Data for Lab 3
-- Student: PANNALA HARSHAVARDHAN REDDY (252U1R1182)
-- Section: CSE-2D

CREATE TABLE IF NOT EXISTS book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price INTEGER NOT NULL,
  pages INTEGER DEFAULT 0
);

-- Reset table and autoincrement counter for clean seeding
DELETE FROM book;
DELETE FROM sqlite_sequence WHERE name = 'book';

-- Seed Data (10 books covering diverse titles, authors, and price ranges)
INSERT INTO book (id, title, author, price, pages) VALUES
(1, 'Clean Code', 'Robert C. Martin', 650, 464),
(2, 'The Pragmatic Programmer', 'Andrew Hunt, David Thomas', 799, 352),
(3, 'JavaScript: The Good Parts', 'Douglas Crockford', 450, 176),
(4, 'You Don''t Know JS: Scope & Closures', 'Kyle Simpson', 399, 98),
(5, 'Design Patterns', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', 899, 395),
(6, 'Introduction to Algorithms', 'Thomas H. Cormen', 1250, 1312),
(7, 'Node.js Design Patterns', 'Mario Casciaro', 720, 520),
(8, 'Head First Design Patterns', 'Eric Freeman, Elisabeth Robson', 680, 694),
(9, 'Refactoring', 'Martin Fowler', 850, 448),
(10, 'Eloquent JavaScript', 'Marijn Haverbeke', 550, 472);
