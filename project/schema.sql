CREATE TABLE post
(
    date DATETIME not null,
    take TEXT not null,
    likes INT not null,
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    FOREIGN KEY (userId) REFERENCES user(id)
);

CREATE TABLE user
(   
    username VARCHAR(25) NOT NULL UNIQUE,
    password VARCHAR(25) NOT NULL,
    id INT AUTO_INCREMENT PRIMARY KEY
);


