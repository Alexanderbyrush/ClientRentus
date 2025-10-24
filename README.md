# ClientRentus

<VirtualHost *>
  DocumentRoot "C:\xampp\htdocs"
  ServerName localhost
</VirtualHost>

<VirtualHost *>
    DocumentRoot "C:/xampp/htdocs/RentUS/public"
    ServerName api.rentus
    <Directory "C:/xampp/htdocs/RentUS/public">
        Options All
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>

<VirtualHost *>
    DocumentRoot "C:/xampp/htdocs/ClientRentus/public"
    ServerName api.rentus
    <Directory "C:/xampp/htdocs/ClientRentus/public">
        Options All
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
