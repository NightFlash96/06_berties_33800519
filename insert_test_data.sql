# Insert data into the tables

USE berties_books;

INSERT INTO books (name, price)VALUES('Brighton Rock', 20.25),('Brave New World', 25.00), ('Animal Farm', 12.99) ;

INSERT INTO users (username, firstname, lastname, email, hashedPassword) VALUES
('gold', 'John', 'Goldsmiths', 'goldsmiths@example.com', '$2b$10$rBmN2MfBGM8NFipK1tSeYu5z9AeLMnya/asfvTItnC.M9PaH8rFtC');