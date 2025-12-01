const url = "https://localhost:3000/";

const btn = document.getElementById('button');
const res = document.getElementById('result');
btn.addEventListener('click', getSneakers);

function getSneakers() {
    fetch(url + 'sneakers')
    .then(response => {
        res.textContent = response.json();})
    .then(data => console.log(data))
    .catch(err => console.error("erreur : " + err));
}