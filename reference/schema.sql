DROP DATABASE servinggo;
SHOW DATABASES;
CREATE DATABASE servinggo;
USE servinggo;

CREATE TABLE customer (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  email     VARCHAR(50)  NOT NULL,
  password  VARCHAR(255) NOT NULL,
  name      VARCHAR(10)  NOT NULL,
  phone_num VARCHAR(15)  NOT NULL
);

CREATE TABLE merchant (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  email     VARCHAR(50)  NOT NULL,
  password  VARCHAR(255) NOT NULL,
  name      VARCHAR(10)  NOT NULL,
  phone_num VARCHAR(15)  NOT NULL
);

CREATE TABLE store (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  merchant_id INT          NOT NULL,
  name        VARCHAR(100) NOT NULL,
  phone_num   VARCHAR(15)  NOT NULL,
  address     VARCHAR(255) NOT NULL,
  account_num VARCHAR(20)  NOT NULL,
  description VARCHAR(255),
  FOREIGN KEY (merchant_id) REFERENCES merchant (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE qr (
  store_id     INT          NOT NULL,
  table_num    INT          NOT NULL,
  relative_url VARCHAR(255) NOT NULL,
  FOREIGN KEY (store_id) REFERENCES store (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  UNIQUE (store_id, table_num)
);

CREATE TABLE menu_category (
  id          INT                     AUTO_INCREMENT PRIMARY KEY,
  merchant_id INT            NOT NULL,
  store_id    INT            NOT NULL,
  name        VARCHAR(100)   NOT NULL,
  description VARCHAR(255),
  show_order  DECIMAL(11, 4) NOT NULL DEFAULT 0,
  FOREIGN KEY (merchant_id) REFERENCES merchant (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (store_id) REFERENCES store (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  UNIQUE (store_id, name)
);

CREATE TABLE menu (
  id          INT                     AUTO_INCREMENT PRIMARY KEY,
  merchant_id INT            NOT NULL,
  category_id INT            NOT NULL,
  name        VARCHAR(100)   NOT NULL,
  description VARCHAR(255),
  price_krw   INT            NOT NULL,
  show_order  DECIMAL(11, 4) NOT NULL DEFAULT 0,
  rating      DECIMAL(3, 2),
  FOREIGN KEY (merchant_id) REFERENCES merchant (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES menu_category (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  UNIQUE (category_id, name)
);

CREATE TABLE `order` (
  id             INT         NOT NULL PRIMARY KEY,
  store_id       INT         NOT NULL,
  customer_id    INT         NOT NULL,
  time           TIMESTAMP   NOT NULL DEFAULT NOW(),
  payment_scheme VARCHAR(30) NOT NULL,
  paid           BOOLEAN     NOT NULL,
  served         BOOLEAN     NOT NULL,
  completed      BOOLEAN     NOT NULL,
  FOREIGN KEY (store_id) REFERENCES store (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customer (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE order_item (
  menu_id  INT NOT NULL,
  order_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  FOREIGN KEY (menu_id) REFERENCES menu (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES `order` (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  UNIQUE (menu_id, order_id)
);