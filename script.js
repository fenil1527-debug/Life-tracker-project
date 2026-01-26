(function() {
  'use strict';

  // vars :-

  const myHabitList = document.getElementById('habitList');
  const myHabitForm = document.getElementById('habitForm');
  const habitInputField = document.getElementById('habitInput');
  const summaryText = document.getElementById('dailySummary');
  const topDate = document.getElementById('dateDisplay');
  const toastBox = document.getElementById('undoToast');
  const toastMsg = document.getElementById('toastText');
  const undoActionBtn = document.getElementById('undoBtn');
  const monthPicker = document.getElementById('monthSelect');
  const chartArea = document.getElementById('analyticsBoard');
  const weekGrid = document.getElementById('weeklyPlanner');
  const mainBar = document.getElementById('progressbar');
  const moodBtns = document.getElementById('moodSelector');

  // local storage fetch hota hai

  let habitsData = JSON.parse(localStorage.getItem('lifetrack-habits')) || [];
  let weeklyPlanData = JSON.parse(localStorage.getItem('lifetrack-weekly-tasks')) || {
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
  };
  let userMood = localStorage.getItem('lifetrack-mood') || null;
  let recentlyRemoved = null;
  let nudgeTimer;
  const NUDGE_INTERVAL = 15000;

  // date ka mahajaal

  function startApp() {
    topDate.textContent = new Date().toDateString();
    fillMonthOptions();
    refreshHabitList();
    refreshWeeklyGrid();
    updateMyChart();
    checkMoodStatus();
    attachEvents();
    getNewQuote();
    startNudgeAlert(); 
  }

  function syncData() {
    localStorage.setItem('lifetrack-habits', JSON.stringify(habitsData));
    localStorage.setItem('lifetrack-weekly-tasks', JSON.stringify(weeklyPlanData));
    localStorage.setItem('lifetrack-mood', userMood);
  }

  // Quote API call

  async function getNewQuote() {
    try {
      const response = await fetch('https://api.quotable.io/random?tags=inspirational');
      const data = await response.json();
      document.getElementById('quoteText').textContent = `"${data.content}"`;
      document.getElementById('quoteAuthor').textContent = `— ${data.author}`;
    } catch (err) {
      document.getElementById('quoteText').textContent = "Consistency is the key to success.";
    }
  }

  // Nudge notification timer

  function startNudgeAlert() {
    clearTimeout(nudgeTimer);
    nudgeTimer = setTimeout(() => {
      const reminders = ["Hey! Drink some water 💧", "Time to stretch a bit! 🧘", "Don't forget your goals! ✨"];
      flashMessage(reminders[Math.floor(Math.random() * reminders.length)], false);
      startNudgeAlert();
    }, NUDGE_INTERVAL);
  }

  // Habit list render logic

  function refreshHabitList() {
    myHabitList.innerHTML = '';
    const todayStr = new Date().toISOString().slice(0, 10);
    
    // reset done status if day changed
    habitsData.forEach(item => { 
      if (item.lastCompleted !== todayStr) item.done = false; 
    });
    
    const finished = habitsData.filter(item => item.done).length;
    const total = habitsData.length;
    const calcPercent = total > 0 ? Math.round((finished / total) * 100) : 0;
    
    if (mainBar) mainBar.style.width = `${calcPercent}%`;
    summaryText.textContent = total ? `Today's Progress: ${calcPercent}% done` : 'Start by adding a habit!';

    habitsData.forEach(item => {
      const habitDiv = document.createElement('div');
      habitDiv.className = `habit ${item.done ? 'done' : ''}`;
      habitDiv.dataset.id = item.id;
      habitDiv.innerHTML = `
        <div class="habit-left" style="display: flex; align-items: center; gap: 15px;">
          <div class="checkbox ${item.done ? 'checked' : ''}">${item.done ? '✓' : ''}</div>
          <div style="text-align: left;">
            <strong style="display: block;">${item.name}</strong>
            <div class="streak" style="font-size: 0.7rem; color: #ff7a18; font-weight: bold;">🔥 ${item.streak} DAYS</div>
          </div>
        </div>
        <button class="btn-del">✕</button>`;
      myHabitList.appendChild(habitDiv);
    });
  }

  // Weekly planner UI logic

  function refreshWeeklyGrid() {
    weekGrid.innerHTML = '';
    Object.keys(weeklyPlanData).forEach(day => {
      const card = document.createElement('div');
      card.className = 'day-card';
      
      let taskLines = weeklyPlanData[day].map((t, idx) => `
        <div class="weekly-task ${t.done ? 'task-done' : ''}">
          <input type="checkbox" ${t.done ? 'checked' : ''} onclick="window.handleWeeklyToggle('${day}', ${idx})">
          <span contenteditable="true" onblur="window.handleWeeklyEdit('${day}', ${idx}, this.innerText)">${t.text}</span>
          <button class="btn-del-small" onclick="window.handleWeeklyDelete('${day}', ${idx})">✕</button>
        </div>
      `).join('');

      card.innerHTML = `
        <span class="day-name">${day}</span>
        <div class="weekly-tasks-list">${taskLines}</div>
        <button class="btn-add-small" onclick="window.handleWeeklyAdd('${day}')">+ New Task</button>
      `;
      weekGrid.appendChild(card);
    });
  }

  // Window functions for interaction

  window.handleWeeklyAdd = (day) => {
    const val = prompt("Task for " + day);
    if (val) { weeklyPlanData[day].push({ text: val, done: false }); syncData(); refreshWeeklyGrid(); }
  };

  window.handleWeeklyToggle = (day, idx) => {
    weeklyPlanData[day][idx].done = !weeklyPlanData[day][idx].done;
    syncData(); refreshWeeklyGrid();
  };

  window.handleWeeklyDelete = (day, idx) => {
    weeklyPlanData[day].splice(idx, 1);
    syncData(); refreshWeeklyGrid();
  };

  window.handleWeeklyEdit = (day, idx, txt) => {
    weeklyPlanData[day][idx].text = txt;
    syncData();
  };

  // Event listeners setup

  function attachEvents() {
    window.addEventListener('mousedown', startNudgeAlert);
    window.addEventListener('keydown', startNudgeAlert);

    myHabitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputVal = habitInputField.value.trim();
      if (!inputVal || habitsData.some(h => h.name.toLowerCase() === inputVal.toLowerCase())) return;
      habitsData.push({ id: Date.now(), name: inputVal, streak: 0, done: false, history: [] });
      habitInputField.value = '';
      syncData(); refreshHabitList(); updateMyChart();
    });

    myHabitList.addEventListener('click', (e) => {
      const habitId = e.target.closest('.habit')?.dataset.id;
      if (!habitId) return;
      const targetHabit = habitsData.find(x => x.id == habitId);
      const today = new Date().toISOString().slice(0, 10);

      if (e.target.classList.contains('checkbox')) {
        targetHabit.done = !targetHabit.done;
        
        // --- VERIFY DATA LOGIC ---
        if (targetHabit.done) {
          targetHabit.lastCompleted = today;
          if (!targetHabit.history) targetHabit.history = [];
          if (!targetHabit.history.includes(today)) {
            targetHabit.history.push(today);
            targetHabit.streak++;
          }
        } else {
          targetHabit.lastCompleted = null;
          targetHabit.history = targetHabit.history.filter(d => d !== today);
          targetHabit.streak = Math.max(0, targetHabit.streak - 1);
        }
        syncData(); refreshHabitList(); updateMyChart();
      } 
      
      if (e.target.classList.contains('btn-del')) {
        recentlyRemoved = targetHabit;
        habitsData = habitsData.filter(x => x.id != habitId);
        syncData(); refreshHabitList(); updateMyChart();
        flashMessage("Habit removed", true);
      }
    });

    undoActionBtn.addEventListener('click', () => {
      if (recentlyRemoved) {
        habitsData.push(recentlyRemoved);
        recentlyRemoved = null;
        syncData(); refreshHabitList(); updateMyChart();
        toastBox.classList.add('toast-hidden');
      }
    });

    moodBtns.addEventListener('click', (e) => {
      const button = e.target.closest('button');
      if (button) { userMood = button.dataset.mood; syncData(); checkMoodStatus(); }
    });
    monthPicker.addEventListener('change', updateMyChart);
  }

  // Analytics graph logic

  function updateMyChart() {
    chartArea.innerHTML = '';
    const selectedMonth = monthPicker.value; // Format: YYYY-MM
    if (habitsData.length === 0) return;

    // Calculate completions for selected month
    const habitCounts = habitsData.map(h => {
      const history = h.history || [];
      return history.filter(date => date.startsWith(selectedMonth)).length;
    });

    const highestCount = Math.max(...habitCounts, 1);

    habitsData.forEach((h, i) => {
      const days = habitCounts[i];
      const barHeight = (days / highestCount) * 100;
      
      const barWrapper = document.createElement('div');
      barWrapper.className = 'bar-wrapper';
      barWrapper.innerHTML = `
        <div class="bar" style="height:0px">
          <span class="bar-percent">${days} Days</span>
        </div>
        <span class="bar-label">${h.name.substring(0,6)}..</span>`;
      
      chartArea.appendChild(barWrapper);
      
      // trigger animation
      setTimeout(() => { 
        const actualBar = barWrapper.querySelector('.bar');
        if (actualBar) {
          actualBar.style.height = days > 0 ? `${Math.max(barHeight, 15)}%` : '5px'; 
        }
      }, 150);
    });
  }

  function fillMonthOptions() {
    const todayDate = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(todayDate.getFullYear(), todayDate.getMonth() - i, 1);
      const option = document.createElement('option');
      option.value = d.toISOString().slice(0, 7);
      option.textContent = d.toLocaleString('default', { month: 'long', year: 'numeric' });
      monthPicker.appendChild(option);
    }
  }

  function checkMoodStatus() {
    Array.from(moodBtns.children).forEach(b => {
      b.style.background = b.dataset.mood === userMood ? '#ffe0cc' : 'white';
      b.style.borderColor = b.dataset.mood === userMood ? 'var(--primary)' : 'var(--border)';
    });
  }

  function flashMessage(text, canUndo = false) {
    toastMsg.textContent = text;
    toastBox.classList.remove('toast-hidden');
    undoActionBtn.style.display = canUndo ? 'inline-block' : 'none';
    clearTimeout(window.hideTimer);
    window.hideTimer = setTimeout(() => toastBox.classList.add('toast-hidden'), 4000);
  }

  startApp();
})();