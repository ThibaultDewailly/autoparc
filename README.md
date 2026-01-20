Caradm is a car pool administration tool aimed for administrative personnel. It's a web interface, with an API backend as a relational database to store data.

Core feature is Car administration. The application must be designed to GAIN TIME, NOT MISS DEADLINES, and FOLLOW TODOS.

Base objects : 
- cars
- cars operators
- administrative employees in charge of the car pool
- Insurance companies
- Garages
- Accident
- Repairs

What is a car : Brand, Model=, grey card, insirance company and License plate (unique identifier)
What is a car operator : An Employee using one or more cars during a given period of time
What is an adminitrative employee : End user of this application
What is an Insurance company : Company in charge of assuring a vehicle and where to declare a potential accident.
What is a Garage : Company in charge of Vehicle repair
What is an accident : An Event associated to a given car
What is a repair : An event associated to an accident to a given car made by a given garage. 

How to use the application :
A Welcome page with a search bar to find a vehicle via Brand, Model or license plate
You can browse the cars, the operators, the administravie employees, The insurance companies, a garage.
For each item, obtain a description and what did this item did to all the cars (history).
In the case of a car, have all it's history, and the author of the actions and items.
A notification center : What to do, the deadlines, a calendar with the different vhicle, a summary of every item list. 

Actions which can be done on a given car :
- Schedule Vehicle Inspection (Every 2 years)
- Declare an accident : Upload Photos / Describe damages at first, can be edited to associate repairs.
- Schedule Random control 2 times ay ear

Who use the application :
Administrative employees only.



Technical constraints :

Backend API written in golang.
Database : PostgreSQL
Frontend : Present data written in React+Vite




