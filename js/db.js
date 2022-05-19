let db;
let highscore = document.getElementById('highscore');

init();

async function init() {
    db = await idb.openDB('scoresDB', 1, {
        upgrade(db) {
            // Create a store of objects
            const store = db.createObjectStore('scores', { keyPath: 'score' });
            // The 'id' property of the object will be the key.
        },
    });

    list();
}

async function list() {
    let tx = db.transaction('scores');
    let scoreStore = tx.objectStore('scores');

    let scores = await scoreStore.getAll();


    if (scores.length) {
        let table = `<table>
        <thead>
          <tr>
            <th>place</th>
            <th>score</th>
            <th>lvl</th>
            <th>lines</th>
          </tr>
         </thead>
         <tbody>`;
        scores.reverse().forEach((el, index) => {
            table += `<tr>
        <td>${index+1}</td>
        <td>${el.score}</td>
        <td>${el.lvl}</td>
        <td>${el.lines}</td>
        </tr>`
        });
        table += `</tbody></table>`;
        highscore.innerHTML = table;
    } else {
        highscore.innerHTML = '<li>no scores.</li>'
    }

}

export async function clearScores() {
    let tx = db.transaction('scores', 'readwrite');
    await tx.objectStore('scores').clear();
    await list();
}

export async function addScore(score, lvl, lines) {
    // let score = 16343;
    // let lvl = 12;
    // let lines = 15;

    let tx = db.transaction('scores', 'readwrite');

    try {
        await tx.store.add({ score, lvl, lines });
        await list();
    } catch (err) {
        if (err.name == 'ConstraintError') {
            // alert("scores has added ealier");
            // await addScore();
        } else {
            throw err;
        }
    }
}

// window.addEventListener('unhandledrejection', event => {
//     alert("Ошибка: " + event.reason.message);
// });