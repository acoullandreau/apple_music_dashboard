# Apple Music Dashboard

Please visit [this page](https://www.acoullandreau.com/dashboard) to see the final result!


Context of this project
------------------------

This apple\_music\_dashboard project actually started as a much smaller journey. I started using Apple Music in 2016, and when I found out I could request an archive with all my usage data, I decided to dive into the data!

It occured to me, after a few hours wrangling, cleaning, looking from different angles at the data, that it may be useful for other people to be able to dive into their own data without going through the trouble of parsing and processing it all. And just like that, this dashboard was born!


This repository and the code 
----------------------------

This repository contains the source code of the webpage that is available at [www.acoullandreau.com/dashboard](www.acoullandreau.com/dashboard).

To build this website, I relied on a few major blocks:
- React to start with! Not using create-react-app, but webpack with Babel to have a finer control on what was going on..
- a webworker to perform all the processing of the data without freezing the rendering thread
- [Semantic UI](https://react.semantic-ui.com) for the buttons, filters,....
- [Plotly](https://plotly.com/javascript/) for all the graphs

The idea was to offer a simple yet powerful interface for users to interact with their data, exclusively working *offline* (no content ever leaves their device), and provinding a smooth user experience!


Code documentation
------------------

The application is divided into two main blocks:
- the rendering block, divided into three menus:

	- the home page, from where the user can choose which archive to use as data source (provided it is an archive Apple sent)
	- the graphs page, with various types of visualizations that can be filtered
	- the help page, with information regarding the use of the site as well as a contact form

- the worker, that is in charge of validating the content of the archive loaded, processing the files and building the data structures required to plot

The logic and approach used to process the data are in the continuation of the work done with the python package (except that now it is pure javascript!). Please refer to the documentation of the [python package](https://github.com/acoullandreau/apple_music_analyser) and the [exploratory work](https://github.com/acoullandreau/apple_dashboard_exploration) I did on the dataset to learn more about the approach! 


Test functions
-----------------

No test suite is available yet, definitely something to improve rather sooner than later!


Further work and improvements
-----------------------------

I hope to be able to gather feedback from users, because having other people's insight on how to improve this package is most probably going to bring up new ideas! So far, I can identify four areas of improvement:

- make this website fully supported by mobile devices (currently well suited for a rather big screen, not designed for a smaller one)
- add meta data about the music (cover, year of release,....), using the Apple Music API
- use the historical data to build recommended playlist, maybe try to find pattenrs, cycles in the way music is being listened to, add some "intelligence" to the analysis performed
- include more visualizations, that I could be building on my own without using Plotly, to really fit the context and really tell a story

There may be a way also, one day, to build a pipeline to collect data using the Apple Music API to be able to perform the analysis at any moment, not upon requesting the archive to Apple. At the moment, this would imply being able to store the data somewhere...and actually somewhat recreate the database Apple already feeds... 


Sources, acknowlegments and related content
-------------------------------------------

This project actually started as a much smaller journey, a simple exploration of my personal data from the Apple Music service. It occured to me, after a few hours wrangling, cleaning, looking from different angles at the data, that it may be useful for other people to be able to dive into their own data without going through the trouble of parsing and processing it all. And just like that, two projects were born: a python package, and this webpage for anyone to parse/process locally and visualize a set of nice graphs and representation. 

If you want to check out the data analysis process I went through before building this package --> [Exploratory analysis](https://github.com/acoullandreau/apple_dashboard_exploration)

If you want to learn more about the python package I released --> [Apple Music Analyser](https://github.com/acoullandreau/apple_music_analyser)

