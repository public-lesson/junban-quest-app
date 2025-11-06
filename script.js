// --- データ設定 ---
const morningTasks = [
    { id: 1, name: 'あさごはんを たべる', icon: 'fa-utensils' },
    { id: 2, name: 'はをみがく', icon: 'fa-tooth' },
    { id: 3, name: 'ふくを きる', icon: 'fa-shirt' },
    { id: 4, name: 'しゅっぱつ！', icon: 'fa-door-open' },
];
const eveningTasks = [
    { id: 1, name: 'ふくを きがえる', icon: 'fa-tshirt' },
    { id: 2, name: 'おやつを たべる', icon: 'fa-cookie-bite' },
    { id: 3, name: 'しゅくだいを する', icon: 'fa-book-open' },
    { id: 4, name: 'あしたの じゅんび', icon: 'fa-box-archive' },
];

// --- 初期設定 ---
const currentTaskArea = document.getElementById('current-task-area');
const doneListArea = document.getElementById('done-list-area');
const routineTitle = document.getElementById('routine-title');
const btnMorning = document.getElementById('btn-morning');
const btnEvening = document.getElementById('btn-evening');
let currentTasks = [];
let currentTimerId = null;

// --- 関数定義 ---
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}<span style="font-size: 0.7em;">ふん</span><br>${String(sec).padStart(2, '0')}<span style="font-size: 0.7em;">びょう</span>`;
}

function createSvgElement(tag, attributes) {
    const elem = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (let attr in attributes) {
        elem.setAttribute(attr, attributes[attr]);
    }
    return elem;
}

function render() {
    currentTaskArea.innerHTML = '';
    doneListArea.innerHTML = '';
    const doneTasks = currentTasks.filter(task => task.isDone);
    doneTasks.forEach(task => {
        const doneCard = document.createElement('div');
        doneCard.className = 'task-card done-card';
        doneCard.innerHTML = `<i class="fa-solid ${task.icon}"></i> ${task.name}`;
        doneListArea.appendChild(doneCard);
    });

    const nextTask = currentTasks.find(task => !task.isDone);
    if (nextTask) {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.innerHTML = `<i class="fa-solid ${nextTask.icon}"></i> ${nextTask.name}`;
        currentTaskArea.appendChild(taskCard);

        const timerContainer = document.createElement('div');
        timerContainer.className = 'timer-container';
        
        const presets = [5, 10, 30, 60];
        const timerPresetsContainer = document.createElement('div');
        timerPresetsContainer.className = 'timer-presets';
        presets.forEach(min => {
            const btn = document.createElement('button');
            btn.className = 'preset-btn';
            btn.textContent = `${min}ふん`;
            btn.addEventListener('click', () => startTimer(nextTask, min * 60, timerPresetsContainer));
            timerPresetsContainer.appendChild(btn);
        });
        timerContainer.appendChild(timerPresetsContainer);

        const svgContainer = document.createElement('div');
        svgContainer.className = 'svg-timer-container';
        
        const svg = createSvgElement('svg', { viewBox: '-20 -20 240 240' });
        svg.appendChild(createSvgElement('circle', { cx: 100, cy: 100, r: 90, stroke: '#e9ecef', 'stroke-width': 10, fill: 'transparent' }));
        
        const remainingPath = createSvgElement('circle', {
            id: `timer-path-${nextTask.id}`,
            cx: 100, cy: 100, r: 90,
            stroke: '#28a745', 'stroke-width': 10, fill: 'transparent',
            'stroke-dasharray': '565.48', 'stroke-dashoffset': '565.48',
            transform: 'rotate(-90 100 100)'
        });
        svg.appendChild(remainingPath);
        
        const ticksGroup = createSvgElement('g', { stroke: '#ced4da' });
        for (let i = 0; i < 60; i++) {
            const isFiveMinMark = i % 5 === 0;
            ticksGroup.appendChild(createSvgElement('line', {
                x1: 100, y1: 10, x2: 100, y2: isFiveMinMark ? 25 : 20,
                'stroke-width': isFiveMinMark ? 2.5 : 1.5,
                transform: `rotate(${i * 6}, 100, 100)`
            }));
        }
        svg.appendChild(ticksGroup);

        // ▼▼▼ ここから数値目盛りを追加する処理（修正版） ▼▼▼
        const numbersGroup = createSvgElement('g', { class: 'timer-number-label' });
        // 0から50まで、10ずつ増やしながらループする
        for (let number = 0; number <= 50; number += 10) {
            const angleDegrees = number * 6 - 90;
            const angleRadians = angleDegrees * (Math.PI / 180);
            const radius = 105;
            const x = 100 + radius * Math.cos(angleRadians);
            const y = 100 + radius * Math.sin(angleRadians);

            const textElement = createSvgElement('text', {
                x: x, y: y,
                'text-anchor': 'middle',
                'dominant-baseline': 'middle'
            });
            textElement.textContent = number;
            numbersGroup.appendChild(textElement);
        }
        svg.appendChild(numbersGroup);
        // ▲▲▲ ここまで ▲▲▲

        svgContainer.appendChild(svg);
        const timerDisplay = document.createElement('div');
        timerDisplay.className = 'timer-display';
        timerDisplay.id = `timer-display-${nextTask.id}`;
        timerDisplay.innerHTML = 'じかんを<br>セットしてね';
        svgContainer.appendChild(timerDisplay);
        timerContainer.appendChild(svgContainer);
        currentTaskArea.appendChild(timerContainer);
        
        const completeButton = document.createElement('button');
        completeButton.className = 'complete-btn';
        completeButton.textContent = 'できた！';
        completeButton.addEventListener('click', () => {
            if (currentTimerId) { clearInterval(currentTimerId); currentTimerId = null; }
            nextTask.isDone = true;
            render();
        });
        currentTaskArea.appendChild(completeButton);
    } else {
        currentTaskArea.innerHTML = '<div class="all-done-message">ぜんぶ おわったね！すごい！</div>';
    }
}

function startTimer(task, durationInSeconds, presetsContainer) {
    if (currentTimerId) { clearInterval(currentTimerId); }

    let remainingTime = durationInSeconds;
    const maxSeconds = 3600;
    
    const timerDisplay = document.getElementById(`timer-display-${task.id}`);
    const remainingPath = document.getElementById(`timer-path-${task.id}`);
    const fullCircle = 565.48;

    if (presetsContainer) { presetsContainer.style.display = 'none'; }
    
    const updateDisplay = () => {
        timerDisplay.innerHTML = formatTime(remainingTime);
        const ratio = remainingTime / maxSeconds;
        const dashoffset = fullCircle * (1 - ratio);
        remainingPath.setAttribute('stroke-dashoffset', dashoffset);
    };

    updateDisplay();

    currentTimerId = setInterval(() => {
        remainingTime--;
        updateDisplay();
        if (remainingTime < 0) {
            clearInterval(currentTimerId);
            currentTimerId = null;
            timerDisplay.innerHTML = 'じかんぎれ！';
            remainingPath.setAttribute('stroke-dashoffset', fullCircle);
        }
    }, 1000);
}

function switchRoutine(routineType) {
    if (currentTimerId) { clearInterval(currentTimerId); currentTimerId = null; }
    const sourceTasks = routineType === 'morning' ? morningTasks : eveningTasks;
    routineTitle.textContent = routineType === 'morning' ? 'あさのじゅんび' : 'かえってからのこと';
    currentTasks = sourceTasks.map(task => ({ ...task, isDone: false }));
    btnMorning.classList.toggle('active', routineType === 'morning');
    btnEvening.classList.toggle('active', routineType !== 'morning');
    render();
}

btnMorning.addEventListener('click', () => switchRoutine('morning'));
btnEvening.addEventListener('click', () => switchRoutine('evening'));

switchRoutine('morning');
