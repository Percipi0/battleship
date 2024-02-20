CS193X Final Project
====================

Project Title: Battleship!
Your Name: Logan Schreier
Your SUNetID: logansch

Overview
--------
Battleship! is a web application that allows two people to connect to a room and play Battleship in an online multiplayer setting.

Running
-------
npm install and npm start should be sufficient to get the Battleship! server up and running. For my own testing purposes I used my IP and port 1930 to connect, and other people helped me playtest by connecting to my IP at port 1930 while we were connected to the same WiFi network.

Do we need to load data from init_db.mongodb? I think you may need to load data from there.

Features
--------
Battleship! uses socket.io to coordinate the creation of a new room, joining of players, setup of the game, the firing of shots and sinking of ships, as well as letting both players know when the game is over.
My application prevents rooms with duplicate IDs from being created, and further the Battleship! client only listens to messages with the same ID as the current room ID, meaning that many, many players can play Battleship! together at the same time, in their own rooms.
Just imagine the Battleship game (with a few rules taken from the British version instead) and then imagine playing it against your friend online!

Collaboration and libraries
---------------------------
I used socket.io and consulted their documentation heavily, and I consulted Stack Overflow for CSS/JS tips. This project was coded from scratch other than using code from previous CS193X assignments for a foundation in the networking/API stuff.

Anything else?
-------------
I loved this course, easily one of my favorite at Stanford so far! Also thank you to Chris Moffitt for recommending socket.io to me - it was absolutely critical to the execution of Battleship!
I hope y'all enjoy playing Battleship! as much as I enjoyed creating it. I also hope there aren't any technical problems that I didn't forsee lol
If it's possible, please let me know if you were able to play a 1v1 between two computers or something like that. I would just really enjoy hearing that it all worked
footnote: the game basically has mobile support, at least on my phone. So for an iPhone or a phone with a different screen size as my own, I'm not sure how good it would look. But it does run, and you can play a whole game between mobile and PC! 