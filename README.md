# OpenMarketGuide for Google’s Immersive Geospatial Challenge

ALSO SEE https://github.com/vangjv/OpenMarketGuideAPI

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Inspiration
I've been to a plant sale where it was time consuming looking through multiple vendors just to find out that the plant I was looking for was not being sold. Wouldn't it be nice to be able to search for what you are looking for and pinpoint exactly which vendor is selling it?  Although we all have done our share of window shopping. Nowadays, most people can do their shopping in the comfort of the own homes.  For open markets such as farmer's markets and crafts sales, sometimes it’s easier to glance through a market place visually rather than reading a description of what is being sold. 
 2D pictures is a great representation but what if we could explore markets in 3D? 

In addition, with improvements in 3d model creation (gaussian splatting) and generative 3d, it’s becoming more and more easy to represent what you are selling to customers in 3d. (Example of gaussian splat via polycam in app)

## What it does
OpenMarketGuide is a web application that helps facilitate the planning, coordinating and execution of open markets.  It provides tools for market planners to map out their market by placing vendor locations,  and other market necessities such as restrooms, food and water.

By sharing a link to the market, customers can easily explore a market in 3D before visiting or while visiting.  During the market, vendors can post

## How we built it
The front end application is build with Angular.  It utilizes CesiumJS library for 3d mapping and uses Google’s Photorealistic tiles as the map layer.  The front end is a single page application that is hosted by a cloud provider 

The data layer of the application is CosmosDB hosted in Azure.  3d models and product images are stored in Azure Blob storage.

The API layer of the application is a .NET 6 application hosted in Azure App Service.
The secrets are protected by Azure Key Vault and the Authentication/user management is handled by Azure Active Directory B2C

## Challenges we ran into
Cesium is a beast!  It does so much. There is so much documentation for it but sometimes it's older documentation.  Getting the coordinate system and terrain/height of entities correctly is still a struggle. Also had a hard time getting cesium typings to work with Angular.  Still unknown how to use it with typings but hacked it to work.

Participating in a hackathon with a 3 month old baby is tough! Special thanks to a very supportive spouse and a baby that doesn't mind her daddy jamming at a keyboard while holding her!

## Accomplishments that we're proud of
Generating images used in the app with AI (check out the person with six fingers on the front page!) Groovy!

## What we learned
3D is tough (math is hard)
ChatGPT and Copilot are game changers! 

## What's next for Open Market Guide
-Refactor, refactor, refactor
-Implement AI to take a picture of products being sold and auto populate products in their vendor profile.
-Implement gaussian splatting pipeline in app (currently you need to use another app and upload your glb file)
-Finish developing incomplete functionality (Entity deletion, vendor invite process, product and market search)
-Implement map overlay for indoor markets
-Implement arrow placement and traffic markets
-UX improvements
-Implement AR experience with what has been mapped in 3D
-Integration with delivery services?
