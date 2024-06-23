const notes = {
    'a': 'C',
    'w': 'C#',
    's': 'D',
    'e': 'D#',
    'd': 'E',
    'f': 'F',
    't': 'F#',
    'g': 'G',
    'y': 'G#',
    'h': 'A',
    'u': 'A#',
    'j': 'B'
};

window.onload = () => {
    drawKeyboard();
};

// 鍵盤の描画メソッド
const drawKeyboard = () => {
    // 鍵盤の生成(音階を表す文字列を配列に入れておきます)
    const musicalScaleArray = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    let baseKey;
    // 1つ1つ鍵盤を作っていく作業
    for (let i = 0; i < 12; i++) {
      // 鍵盤をボタンとして作成する
      const key = document.createElement("button");
      // idに音階の情報を付与(スタートはC3になるようにしています)
    //   key.id = `key_${musicalScaleArray[i % musicalScaleArray.length]}${Math.floor(i / 12) + 3}`;
  
      // クリックしている間に音が出るという仕様にする
    //   key.onmousedown = play;
    //   key.onmouseup = stop;
    //   key.onmouseleave = stop;
  
      // 黒鍵が白鍵かによってデザインを変えるので、そのためのclassをそれぞれ付与
      if (musicalScaleArray[i % 12].indexOf("#") > -1) {
        // 黒鍵(#がついている)
        key.classList.add("black");
      } else {
        // 白鍵
        key.classList.add("white");
        baseKey = document.createElement("div");
      }
      baseKey.appendChild(key);
      document.getElementById("keyboard").appendChild(baseKey);
    }
};
const activeSynths = {};

document.addEventListener('keydown', (event) => {
    if (notes[event.key] && !activeSynths[event.key] && !event.repeat) {
        const note = notes[event.key];
        playChord(note, event.key);
    }
});

document.addEventListener('keyup', (event) => {
    if (activeSynths[event.key]) {
        stopChord(event.key);
    }
});

function playChord(note, key) {
    const synth = new Tone.PolySynth().toDestination();
    activeSynths[key] = synth;

    const octaves = ['2', '3', '4', '5', '6', '7', '8'];
    const chord = octaves.map(oct => note + oct);
    synth.triggerAttack(chord);
}

function stopChord(key) {
    if (activeSynths[key]) {
        activeSynths[key].releaseAll();
        delete activeSynths[key];
    }
}