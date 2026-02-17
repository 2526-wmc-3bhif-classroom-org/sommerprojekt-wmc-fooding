console.log('Frontend startet...');

const startFrontend = () => {
    const root = document.getElementById('app');
    if (root) {
        root.innerHTML = '<h1>Frontend läuft (reines TypeScript)</h1>';
    }
}

document.addEventListener('DOMContentLoaded', startFrontend);

//  1. Das Element holen
// const meinButton = document.getElementById("ditto");
// console.log("Habe ich den Button?", meinButton);
// meinButton?.addEventListener("click", () => {
//     loadPokemon("ditto");
//});
