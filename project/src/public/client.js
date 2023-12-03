let store = {
    user: { name: "Student" },
    apod: '',
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
    page: 'home',
    active: 'apod'
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store);
}

const render = (root, state) => {
    root.innerHTML = App(state)
    const navItems = root.getElementsByClassName('nav-link');
    [...navItems].forEach((element, i) => { i < 4 ? NavItemClicking(element) : null });
}


// create content
const App = (state) => {
    let { rovers, apod } = state

    return `
        ${header(rovers)}
        <main>
            ${Greeting(store.user.name)}
            ${Home(state)}
        </main>
        <footer></footer>
    `
}

const Home = (state) => {
    let { active, page } = state
    if (active === 'apod') {
        return Apod(state)
    } else if (page === 'manifest') {
        return Manifest(state)
    }
}

const Apod = (state) => {
    let { apod } = state
    return `
        <section>
            <h3>Put things on the page!</h3>
            <p>Here is an example section.</p>
            <p>
                One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                but generally help with discoverability of relevant imagery.
            </p>
            ${ImageOfTheDay(apod)}
        </section>
    `
}

const Manifest = (state) => {

    if (state.active !== 'apod') {
        return roverInfo(state)
    }
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate()) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

const header = (rovers) => {
    return (`
        <header>
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                <div class="container-fluid">
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarTogglerDemo01">
                        <a class="navbar-brand" href="#">
                            <img src="/assets/images/rover-logo.jpg" alt="" width="30" height="24">
                        </a>
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li id='apod' class='nav-link active'>Home</li>
                            ${rovers.map(rover => (`<li id='${rover}' class='nav-link'>${rover}</li>`)).join("")}
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    `)
}

const roverInfo = (state) => {
    let { page, active, roverInfo } = state

    if (!roverInfo || (roverInfo && active !== roverInfo.photo_manifest.name)) {
        getRoverInfo(state)
        return `<h1>Loading...</h1>`
    }

    if (roverInfo) {
        let { roverInfo } = state
        let { name, launch_date, landing_date, max_sol, max_date, status } = roverInfo.photo_manifest
        const RoverInfoSection = `
            <div class="card w-100">
                <div class="card-body">
                    <h5 class="card-title">${name}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">Launch date: ${launch_date}</h6>
                    <h6 class="card-subtitle mb-2 text-muted">Landing date: ${landing_date}</h6>
                    <h6 class="card-subtitle mb-2 text-muted">Status: ${status}</h6>
                    <h6 class="card-subtitle mb-2 text-muted">Max sol: ${max_sol}</h6>
                    <h6 class="card-subtitle mb-2 text-muted">Max date: ${max_date}</h6>
                </div>
            </div>
            `
        if (!state.roverPhoto || (state.roverPhoto && state.roverPhoto.photos[0].rover.name !== active)) {
            getRoverPhoto(state)
            return `
                ${RoverInfoSection}
                <h6>Loading... </h6>
            `
        } else {
            let { photos } = state.roverPhoto
            return `
                ${RoverInfoSection}
                <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3  g-4">
                ${photos.map(photo => `
                    <div class="col">
                        <div class="card bg-dark text-white border border-5 border-warning">
                            <img src="${photo.img_src}" class="card-img-top" alt="...">
                            <div class="card-img-overlay">
                                <p class="card-text">Photo id: ${photo.id}</p>
                                <p class="card-text">Date: ${photo.earth_date}</p>
                            </div>
                        </div>
                    </div>
                        `).join('')}
                </div>
            `
        }
    }
}

const RoverPhoto = (state) => {
    if (!state.roverPhoto) {
        getRoverPhoto(state)
    }
    if (state.roverPhoto) {
        let { photos } = state.roverPhoto
        return `
        <div class="row row-cols-1 row-cols-md-2 g-4">
            <div class="col">
                ${photos.map(photo => `
                    <div class="card">
                        <img src="${photo.img_src}" class="card-img-top">
                        <div class="card-body">
                            <p class="card-text"></p>
                        </div>
                    </div>
                    `)}
            </div>
        </div>
        `
    }

}

const NavItemClicking = (nav) => {
    console.log(nav.className)
    let newState = new Object
    if (nav.className.includes('nav-link')) {
        newState.page = 'manifest'
    }
    if (nav.id === store.active) {
        nav.classList.add('active')
    } else {
        nav.classList.remove('active')
    }
    nav.addEventListener("click", () => {
        newState.active = nav.id;
        if (nav.id === "apod") {
            updateStore(store, newState)
        } else {
            updateStore(store, newState)
        }
        console.log(store)
    },
        false
    )
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))

    // return data
}

// API call
const getRoverInfo = async (state) => {
    let { active, page } = state
    await fetch(`http://localhost:3000/${page}/${active}`)
        .then(res => res.json())
        .then(data =>
            updateStore(store, {
                roverInfo: data
            }))
        .catch(err => console.error(err))
}

const getRoverPhoto = async (state) => {
    let { active, page, roverInfo } = state
    let photoReq = Object.assign({}, { name: roverInfo.photo_manifest.name.toLowerCase(), max_sol: roverInfo.photo_manifest.max_sol })
    console.log(photoReq)
    if (photoReq) {
        await fetch(`http://localhost:3000/${page}/${active.toLowerCase()}/photo/${photoReq.max_sol}`)
            .then(res => res.json())
            .then(data =>
                updateStore(store, {
                    roverPhoto: data
                }))
            .catch(err => console.error(err))
    }
}
