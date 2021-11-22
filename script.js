const FILM_LIMIT = 7
const modal = document.getElementsByClassName("modal")[0]
const span = document.getElementsByClassName("close")[0]
const rarrow = document.getElementsByClassName("right-arrow")
const larrow = document.getElementsByClassName("left-arrow")

// Methode fetch pour récupérer les films
async function fetch_movies(url,limit = FILM_LIMIT,){
  const response = await fetch(url)
  const data = await response.json()
  const response2 = await fetch(data.next)
  let movies
  if (response2.status === 200){
    const data2 = await response2.json()
    movies = data.results.concat(data2.results)
  } else{
    movies = data.results
  }
  return movies.slice(0,limit)
}
// Methode fetch pour récupérer les DONNEES des films 
async function fetch_movie_data(movie){
  let url = movie.url
  const response = await fetch(url)
  const data = await response.json()
  return data
}
// Attribution des données récoltés pour chaque film
async function get_movie_datas(genre = String,endpoint="?genre=") {
  let url = `http://127.0.0.1:8000/api/v1/titles/${endpoint}${genre}`
  let movie_datas = []
  let movie_list = await fetch_movies(url)
  for (let movie of movie_list){
    let movie_data = await fetch_movie_data(movie)
    movie_datas.push(movie_data)
  }
  return movie_datas
}
// Création des élements du DOM
function create_movie_element(movie){
  const movie_element = document.createElement("div")
  movie_element.classList.add("movie")
  const img = create_img_element(movie.image_url)
  movie_element.appendChild(img)
  movie_element.addEventListener("click", function(){
    create_movie_modal_content(movie)
  });
  return movie_element
}

function create_img_element(source){
  const img_element = document.createElement("img")
  img_element.src = source
  return img_element
}

function create_li_element(content){
  const li_element = document.createElement("li")
  li_element.innerHTML = content
  return li_element
}

function create_movie_modal_content(movie){
    modal.style.display = "block"
    const modal_content = document.getElementsByClassName("modal-content")[0]
    const ul = document.createElement("ul")
    modal_content.appendChild(ul)
    let movie_img = create_img_element(movie.image_url)
    ul.appendChild(movie_img)
    const infos = ["title","genres","date_published","rated","imdb_score","directors","actors","duration","countries","worldwide_gross_income","description"]
    const pretty_titles = ["Titre","Genres","Date de sortie","Rating","Score imdb","Réalisateur","Liste des acteurs","Durée du film","Pays d'origine","Résultat au Box Office","Résumé du film"]
    for (let index = 0; index < infos.length; index++) {
      let data = infos[index];
      const li = create_li_element(`${pretty_titles[index]}: ${movie[data]}`)
      ul.appendChild(li)
      
    }
}
// Clear de la modal 
function close_modal(){
  modal.style.display = "none"
    let ul = modal.querySelector("ul")
    ul.remove()
}

// Créer les div des catégories
async function create_div_from_list(liste_category){
  for(let heading of liste_category){
    let movie_datas = await get_movie_datas(heading.innerHTML)
    create_div_from_data(movie_datas,heading.innerHTML)
  }
}
// Créer les divs ainsi que leurs contenu
function create_div_from_data(movie_datas,container_name){
let heading_container = document.querySelector(`#${container_name}-container`)
for(let movie of movie_datas){
  const movie_element = create_movie_element(movie)
  heading_container.appendChild(movie_element)
}
}

// IIFE (Immediatly Invoked Function Expression) et donc, exécutions des fonctions
(async () => {

  // Fermeture Modal
  span.addEventListener("click",function() {
    close_modal()
  })
  window.addEventListener("click",function(event){
    if (event.target === modal){
     close_modal()
    }
  })
  
  // Section Films les mieux notés
  let best_movies = await get_movie_datas("-imdb_score",endpoint="?sort_by=")
  create_div_from_data(best_movies,"-imdb_score")

  // Section MEILLEUR FILM (avec boutton play)
  const meilleur_film = best_movies[0]
  const bm_desc = document.createElement("p")
  bm_desc.setAttribute("align","justify")
  document.querySelector(".bm-description").appendChild(bm_desc)
  document.querySelector(".bm-title").innerHTML = meilleur_film.title
  bm_desc.innerHTML = meilleur_film.description
  bm_desc.classList.add("bm-desc")
  bm_img = document.querySelector("#bm-img")
  document.querySelector("#bm-img").src = meilleur_film.image_url
  bm_img.addEventListener("click", function(){
    create_movie_modal_content(meilleur_film)
  });

  // Les 3 autres catégories
  const headings = document.getElementsByTagName("h1")
  await create_div_from_list(headings)
  
  // Buffer Circulaire
  for(let arrow of rarrow){
    arrow.addEventListener("click" ,async function(e){
      let wrapper = e.target.parentElement
      let container = wrapper.querySelector(".movies-container")
      container.scrollBy({
        left: container.offsetWidth/3,
        top: 0,
        behavior:"smooth"})
    })
  }
  for(let arrow of larrow){
    arrow.addEventListener("click" ,async function(e){
      let wrapper = e.target.parentElement
      let container = wrapper.querySelector(".movies-container")
      container.scrollBy({
        left: -container.offsetWidth/3,
        top:0,
        behavior:"smooth"})
    })}
})()
