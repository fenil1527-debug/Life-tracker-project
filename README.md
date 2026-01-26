# Life-tracker-project
end term-2 project 
'A website  which take care of you' 

 Project Description
​LifeTrack is a fully functional Health & Wellness Tracker that I built for my Web Dev II Final Project. The goal was to create an app that helps users track their daily habits, monitor their mood, and plan their week—all without using any frameworks like React or Vue.  
​Everything you see is built with Vanilla JavaScript, HTML, and CSS. The app focuses heavily on DOM manipulation to make the experience feel dynamic and interactive.  


Problem Statement
​I noticed that most productivity apps are either too complicated or they separate "work" (tasks) from "wellness" (mood/health). I wanted to build something simple that combines both.

The Problem: Users need a way to track consistency (habits) and mental health (mood) in one place without logging into a complex system.
My Solution: A browser-based dashboard that saves data locally, so it's fast, private, and always available.
​✨ Features Implemented

​Daily Habit Tracker: You can add habits, mark them as done, and see a live progress bar update instantly.
​Streak Counter: The app calculates how many days in a row you’ve completed a habit using Date logic.
​"Undo" Feature: If you delete a habit by mistake, a Toast Notification pops up allowing you to bring it back (I used setTimeout for this).

​Weekly Planner: A draggable-style grid where you can add tasks for specific days. The text is editable directly on the screen.
​Mood Selector: A simple way to log how you feel today (Happy, Neutral, or Sad).
​Analytics Graph: A bar chart at the bottom that visualizes your habit data for the selected month.
​Dynamic Quotes: I used fetch() to get random inspirational quotes from an external API.

​DOM Concepts Used:-
​Per the project requirements, I focused deeply on DOM manipulation:  

​Dynamic Element Creation: I didn't hardcode the habits. I used document.createElement() to generate habit cards and the graph bars based on the data arrays.
​Event Delegation: Instead of adding listeners to every single delete button, I added them to the parent list container to handle clicks efficiently.

​State Management: I created a central state (habitsData array) that updates the DOM whenever it changes, mimicking how frameworks work but doing it manually.
​Local Storage: I used localStorage.setItem and getItem so that users don't lose their data when they refresh the page.

​Visual Feedback: Used CSS class toggling (e.g., .done, .toast-hidden) via JavaScript to create animations and status updates.
