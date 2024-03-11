# tinyapp

Hi! Im Jack MacDonald!

This is my TinyApp Project under LightHouseLabs! TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

# TinyApp Project

The function of this web app is to take a url from the webside client via a form, associate and store a unique 6 character ID with it and allow you to directly call or be redirected to the site instantly! Phonebook style! 
Users must register and/or login by supplying a Email and Password to veiw their saved urls.

WARNING: LOW SECURITY MESURES ON THIS APP, DO NOT STORE SENSITIVE INFORMATION AND/OR PERSONAL PASSWORDS.

This app is dependant on Express, Cookie-Parser and EJS to run

## Final Product

!["URLS HOMEPAGE"](https://github.com/JackMac10/tinyapp/blob/main/docs/:URLs.jpg?raw=true)
!["LOGIN PAGE"](https://github.com/JackMac10/tinyapp/blob/main/docs/:login.jpg?raw=true)
!["REGISTRATION PAGE"](https://github.com/JackMac10/tinyapp/blob/main/docs/:register.jpg?raw=true)
!["EDIT URL PAGE"](https://github.com/JackMac10/tinyapp/blob/main/docs/urls:id.jpg?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.