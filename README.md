# What is this?
This iteration of this project is a small ASP.NET Core MVC web application that contains a React app using the Strudel library.
Essentially, by following the strudel library syntax, you're able to create music with code. This is supported by a uniform preprocessing logic.
There are various DJ controls that allow you to manipulate the overall sound of the song (preset). 

What this version of the project does is it takes the original React App, and points its Save/Load via JSON functions to simple endpoints via WebAPI.
This lets save/load send & recieve presets from a simple SQL database.

I have also made several quality of life additions, E.g, being able to search for the specific preset due to the feature now being backed into the app,
and no longer being bound to OS specific file system APIs.

# Prerequisites aka what you need to have pre-installed
.NET 8 SDK
https://dotnet.microsoft.com/en-us/download

Visual Studio 2022 (or newer) with ASP.NET and web development workload

SQL Server Express (or any SQL Server ver)

Node.js and npm (for the React app). I would recommend Node 18 LTS or newer
https://nodejs.org/

A compatible Database management system

A compatible browser (E.g Edge, Chrome)

# Database Setup
Load and save depend on a database that is structured correctly. To have this, do the following:
1) Open your database management system of choice

2) Create a database in your DBMS of choice. Call it "StrudelDB".

3) Within that database instance, create a new query, and run this table creation sql:

CREATE TABLE [dbo].[StrudelPresets]
(
[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
[Name] NVARCHAR(100) NOT NULL,
[RawCode] NVARCHAR(MAX) NOT NULL,
[ControlsJson] NVARCHAR(MAX) NOT NULL,
[CreatedAt] DATETIME2 NOT NULL
);

# The Connection String

Once the DB is created and you were able to successfully run the table creation sql,
Open your copy of Visual Studio 2022, and grab a copy of this repo by cloning it. Ensure the solution runs and you're able to navigate through the directory.

As soon as you do, go to StrudelWebApp/appsettings.json, change the string in "ConnectionStrings", specifically associated to "DefaultConnection".
Have it point to the server (Typically your local machine) that contains the Database you created.

# Running the app

Open two powershell instances. One for running the .NET backend needed for the end points, and a second needed for running the react frontend.

First and foremost, you'll want to ensure all of the required modules are installed which you do by:

1) Running the "cd" powershell command until you navigate to the strudel_reactor directory within this project on your computer.

2) Once you are inside StrudelCloud\StrudelWebApp\strudel_reactor:
Run "npm install" to check for and install all modules.

Secondly, we again, rely on the .NET backend, so in the second powershell isntance, run the "cd" command until you are inside StrudelCloud\StrudelWebApp:
As soon as you are, run "dotnet run" to run the backend. Take note of the port that the backend is "listening" at. After that do the following:

1) In visual studio, open strudel_reactor/src/components/SettingsBar.jsx and ensure the digits after "localhost:" in
"const API_BASE_URL = "http://localhost:5138" match the port that the backend is listening at. This may vary based on setup.

2) Once that's sorted, in the powershell instance that is inside StrudelCloud\StrudelWebApp\strudel_reactor:
Run "npm start", let the development environment set up, and run inside your preferred, compatible browser.

Enjoy the app.

# Debugging
I have left several console logs within the code that'll ideally help by giving enough information to solve any connection based issues. This project is feature complete.

# Copyright
I, Dennis Kalongonda, own nothing, please don't send me to jail!




