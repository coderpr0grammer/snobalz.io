
# Snobalz.io
### An online multiplayer .io style game I made in 2021 (grade 8)  
### Play live: https://snobalzio-danielmartinezdev.koyeb.app/

[![](https://www.itsmartinez.com/img/snobalzio.png)](https://www.itsmartinez.com) 

# My first time working on a Node.js Project

I came up with this idea as part of a "Genius hour" project in in the 8th grade. We were supposed to do some sort of challenge.

Ever since I was little and started using Scratch to build games, I had tried to develop a multiplayer game engine using what Scratch called "cloud variables", however they were limited to only 10, making it almost impossible.

So even though I had never used Node.js or Express.js ever, I decided to undertake the project of builiding this game.

Challenges
---
It took me weeks of work along with looking up tutorials on how to use Node.js and Socket.io to enable the real-time websocket communication, and it became very frustrating when the time came to render the game properly on users' screens.

The issue is that since i was using an HTML Canvas element to render the game and I had to build out my own game engine, the game map did not actually exist, it was just some Javascript code that limited players' movement past a certain point.

On top of that, this meant that players would have to be dynamically rendered on a different position on each user's screen, because they were not actually on a fixed position on a map, they were at a certain position relative to the virtual map box and other players.

This made it really challenging to figure out player offsets for each player, but eventually I ended up making it work, although I had to scrap some of the more advanced features I had originally planned (e.g. charging up snow, reviving other players, etc...) since the assignment deadline was coming soon.

All in all, it was a project I felt proud of building since it took me a lot of effort to learn many different concepts (including math) as I was building the game from the ground-up.

![](https://www.itsmartinez.com/img/snobalzio2.png)
