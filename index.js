// 宣告主機位址、index位址
const baseURL = "https://lighthouse-user-api.herokuapp.com/";
const indexURL = baseURL + "api/v1/users/";
const dataPanel = document.querySelector(".data-panel");
const users = [];
const userPage = 24
let filterData = []
let nowPage = 1
const userPaginator = document.querySelector('#user-paginator')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const viewMode = document.querySelector('#viewMode')

// 將帶入的data用forEach一個個帶到rawHTML之中，最後輸出到data-panel之中
function userCardMode(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
     <div class="col-2">
      <div class="card mb-3">
        <img src="${item.avatar}" class="card-img-top" alt="random-user">
        <div data-toggle="modal" data-target="#exampleModal"></div>
        <div class="card-body">
          <h5 class="card-title font-weight-bold text-uppercase d-flex justify-content-center">${item.surname + " " + item.name}</h5>
        </div>
        <div class="card-footer d-flex justify-content-center justify-content-around">
          <button type="button" class="btn btn-outline-success btn-sm font-weight-bold text-uppercase user-more" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">More</button>
          <button class="btn btn-outline-danger btn-sm font-weight-bold text-uppercase user-like" data-id="${item.id}">Like</button>
        </div>
      </div>
    </div>
      `;
  });
  dataPanel.innerHTML = rawHTML;
}

function userListMode(data) {
  let html = '<table class="table"><tbody>'
  data.forEach((item) => {
    html +=
      `
    <tr class="listGroup">
      <td id="list-title"><h5>${item.surname + " " + item.name}</h5></td>
      <td><button type="button" class="btn btn-outline-success btn-lg font-weight-bold text-uppercase user-more" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">More</button>
      <button class="btn btn-outline-danger btn-lg font-weight-bold text-uppercase user-like" data-id="${item.id}">Like</button></td>
    </tr>
    `
  })
  html += `</tbody></table>`
  dataPanel.innerHTML = html
}



// 搭配帶入的id取得個別資料網址後，將個人資料帶入
function userModal(id) {
  const modalTitle = document.querySelector("#user-modal-title");
  const modalImage = document.querySelector("#user-modal-image");
  const modalGender = document.querySelector("#user-modal-gender");
  const modalAge = document.querySelector("#user-modal-age");
  const modalRegion = document.querySelector("#user-modal-region");
  const modalEmail = document.querySelector("#user-modal-email");
  axios.get(indexURL + id).then((response) => {
    let data = response.data;
    modalTitle.innerHTML = data.surname + " " + data.name;
    modalImage.innerHTML = `<img src="${data.avatar}" class="card-img-top d-flex justify-content-center" alt="random-user">`;
    modalGender.innerHTML = `Gender:  ${data.gender} `;
    modalAge.innerHTML = `Age:  ${data.age} `;
    modalRegion.innerHTML = `Region: ${data.region} `;
    modalEmail.innerHTML = data.email;
  });
}

function addToFavorite(id) {
  const favoriteList = JSON.parse(localStorage.getItem('likeList')) || []
  const user = users.find((user) => user.id === id)
  if (favoriteList.some((user) => user.id === id)) {
    return alert('You have clicked like button before')
  }
  favoriteList.push(user)
  localStorage.setItem('likeList', JSON.stringify(favoriteList))
}

function userByPages(page) {
  const data = filterData.length ? filterData : users
  const pages = (page - 1) * userPage
  return data.slice(pages, pages + userPage)
}

function renderPaginator(amount) {
  const usersOfPages = Math.ceil(amount / userPage)
  let rawHTML = ''
  for (let i = 1; i <= usersOfPages; i++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`
  }
  userPaginator.innerHTML = rawHTML
}

searchForm.addEventListener('submit', function searchUsers(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  filterData = users.filter((user) =>
    user.name.toLowerCase().includes(keyword) ||
    user.gender.toLowerCase().includes(keyword) ||
    user.surname.toLowerCase().includes(keyword)
  )
  if (filterData.length === 0) {
    return alert('We can not find it')
  }
  renderPaginator(filterData.length)
  userCardMode(userByPages(nowPage))
})


userPaginator.addEventListener('click', function (event) {
  nowPage = Number(event.target.dataset.page)
  if (event.target.matches('.listStyle')) {
    userListMode(userByPages(nowPage))
  } else if (event.target.matches('.page-link')) {
    userCardMode(userByPages(nowPage))

  }
})

// 在more上掛上監聽器，當點擊時，取出點擊該button相對應的id，回傳到函式中
dataPanel.addEventListener("click", function (event) {
  if (event.target.matches(".user-more")) {
    userModal(Number(event.target.dataset.id));
  } else if (event.target.matches('.user-like')) {
    addToFavorite(Number(event.target.dataset.id))
  }
});

viewMode.addEventListener('click', function changeMode(event) {
  if (event.target.matches('.fa-bars')) {
    userListMode(userByPages(nowPage))
    $('a').addClass('listStyle')
  } else if (event.target.matches('.fa-th')) {
    userCardMode(userByPages(nowPage))
    $('a').removeClass('listStyle')
  }
})

// 獲得indexURL網址中的資料，並將資料一個個帶進users中
axios.get(indexURL).then((response) => {
  users.push(...response.data.results);
  renderPaginator(users.length)
  userCardMode(userByPages(1));
});
