// --- データ設定 ---
const morningTasks = [
    { id: 1, name: 'あさごはんを たべる', icon: 'fa-utensils', isDone: false },
    { id: 2, name: 'はをみがく', icon: 'fa-tooth', isDone: false },
    { id: 3, name: 'ふくを きる', icon: 'fa-shirt', isDone: false },
    { id: 4, name: 'しゅっぱつ！', icon: 'fa-door-open', isDone: false },
];

const eveningTasks = [
    { id: 1, name: 'ふくを きがえる', icon: 'fa-tshirt', isDone: false },
    { id: 2, name: 'おやつを たべる', icon: 'fa-cookie-bite', isDone: false },
    { id: 3, name: 'しゅくだいを する', icon: 'fa-book-open', isDone: false },
    { id: 4, name: 'あしたの じゅんび', icon: 'fa-box-archive', isDone: false },
];


// --- 初期設定 ---
const currentTaskArea = document.getElementById('current-task-area');
const doneListArea = document.getElementById('done-list-area');
const routineTitle = document.getElementById('routine-title');
const btnMorning = document.getElementById('btn-morning');
const btnEvening = document.getElementById('btn-evening');

// morningTasksをコピーして初期タスクリストとして設定
let currentTasks = morningTasks.map(task => ({ ...task, isDone: false }));

// --- 関数定義 ---

// 画面を描画する関数
function render() {
    // まずは表示エリアを空っぽにする
    currentTaskArea.innerHTML = '';
    doneListArea.innerHTML = '';

    // 「おわったこと」リストを作る
    const doneTasks = currentTasks.filter(task => task.isDone);
    doneTasks.forEach(task => {
        const doneCard = document.createElement('div');
        doneCard.className = 'task-card done-card'; // 終わった用のデザインを適用
        doneCard.innerHTML = `<i class="fa-solid ${task.icon}"></i> ${task.name}`;
        doneListArea.appendChild(doneCard);
    });

    // 「いまやること」を見つける
    const nextTask = currentTasks.find(task => !task.isDone);

    if (nextTask) {
        // まだやるべきタスクがある場合
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.innerHTML = `<i class="fa-solid ${nextTask.icon}"></i> ${nextTask.name}`;

        const completeButton = document.createElement('button');
        completeButton.className = 'complete-btn';
        completeButton.textContent = 'できた！';
        
        // ボタンがクリックされた時の処理
        completeButton.addEventListener('click', () => {
            // タスクを完了状態にする
            nextTask.isDone = true;
            // 画面を再描画する
            render();
        });

        currentTaskArea.appendChild(taskCard);
        currentTaskArea.appendChild(completeButton);
    } else {
        // 全てのタスクが終わった場合
        currentTaskArea.innerHTML = '<div class="all-done-message">ぜんぶ おわったね！すごい！</div>';
    }
}

// ルーティンを切り替える関数
function switchRoutine(routineType) {
    if (routineType === 'morning') {
        routineTitle.textContent = 'あさのじゅんび';
        // isDoneの状態をリセットして、新しいタスクリストをセット
        currentTasks = morningTasks.map(task => ({ ...task, isDone: false }));
        // ボタンの見た目を切り替え
        btnMorning.classList.add('active');
        btnEvening.classList.remove('active');
    } else {
        routineTitle.textContent = 'かえってからのこと';
        // isDoneの状態をリセットして、新しいタスクリストをセット
        currentTasks = eveningTasks.map(task => ({ ...task, isDone: false }));
        // ボタンの見た目を切り替え
        btnEvening.classList.add('active');
        btnMorning.classList.remove('active');
    }
    // 画面を再描画
    render();
}

// ボタンにクリックイベントを設定
btnMorning.addEventListener('click', () => switchRoutine('morning'));
btnEvening.addEventListener('click', () => switchRoutine('evening'));


// --- 実行 ---
// 最初に画面を描画する
render();