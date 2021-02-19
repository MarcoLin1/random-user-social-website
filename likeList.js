// 宣告主機位址、index位址
const baseURL = "https://lighthouse-user-api.herokuapp.com/";
const indexURL = baseURL + "api/v1/users/";
const dataPanel = document.querySelector(".data-panel");
const users = JSON.parse(localStorage.getItem('likeList'));
const userPage = 24
let filterData = []
let nowPage = 1
const userPaginator = document.querySelector('#user-paginator')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const viewMode = document.querySelector('#viewMode')

// 將帶入的data用forEach一個個帶到rawHTML之中，最後輸出到data-panel之中
function cardMode(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
     <div class="col-2">
      <div class="card mb-3">
        <img src="${item.avatar}" class="card-img-top" alt="random-user">
        <div class="card-body">
          <h5 class="card-title font-weight-bold text-uppercase d-flex justify-content-center">${item.surname + " " + item.name}</h5>
        </div>
        <div class="card-footer d-flex justify-content-center justify-content-around">
          <button type="button" class="btn btn-outline-success btn-sm user-more font-weight-bold text-uppercase" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">More</button>
          <button class="btn btn-danger btn-sm user-dislike font-weight-bold text-uppercase ml-2" data-id="${item.id}">Dislike</button>
        </div>
      </div>
    </div>
      `;
  });
  dataPanel.innerHTML = rawHTML;
}

function listMode(data) {
  let html = `<table class="table"><tbody>`
  data.forEach((item) => {
    html +=
      `
    <tr class="listGroup">
      <td class="list-title"><h5>${item.surname + " " + item.name}<h5></td>
      <td><button type="button" class="btn btn-outline-success btn-lg user-more font-weight-bold text-uppercase" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">More</button>
      <button class="btn btn-danger btn-lg user-dislike font-weight-bold text-uppercase" data-id="${item.id}">Dislike</button></td>
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
    modalGender.innerHTML = `Gender: ${data.gender} `;
    modalAge.innerHTML = `Age:  ${data.age} `;
    modalRegion.innerHTML = `Region:  ${data.region} `;
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
  const startIndex = (page - 1) * userPage
  return data.slice(startIndex, startIndex + userPage)
}

function renderPaginator(amount) {
  const usersOfPages = Math.ceil(amount / userPage)
  let rawHTML = ''
  for (let i = 1; i <= usersOfPages; i++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`
  }
  userPaginator.innerHTML = rawHTML
}


function removeFromLikeList(id) {
  const userIndex = users.findIndex((user) => user.id === id)
  users.splice(userIndex, 1)
  localStorage.setItem('likeList', JSON.stringify(users))
  cardMode(users)
}


// 在more上掛上監聽器，當點擊時，取出點擊該button相對應的id，回傳到函式中
dataPanel.addEventListener("click", function (event) {
  if (event.target.matches(".user-more")) {
    userModal(Number(event.target.dataset.id));
  } else if (event.target.matches('.user-dislike')) {
    removeFromLikeList(Number(event.target.dataset.id))
  }
});

userPaginator.addEventListener('click', function (event) {
  let nowPage = Number(event.target.dataset.page)
  if (event.target.matches('.listStyle')) {
    listMode(userByPages(nowPage))
  } else if (event.target.matches('.page-link')) {
    cardMode(userByPages(nowPage))
  }
})

searchForm.addEventListener('submit', function searchUsers(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  filterData = users.filter((user) =>
    user.name.toLowerCase().includes(keyword)
  )
  if (filterData.length === 0) {
    return alert('We can not find it')
  }
  renderPaginator(filterData.length)
  cardMode(userByPages(1))
})

viewMode.addEventListener('click', function changeMode(event) {
  if (event.target.matches('.fa-bars')) {
    listMode(userByPages(nowPage))
    $("a").addClass('listStyle')
  } else if (event.target.matches('.fa-th')) {
    cardMode(userByPages(nowPage))
    $("a").removeClass('listStyle')
  }
})



renderPaginator(users.length)
cardMode(userByPages(1));

// 獲得indexURL網址中的資料，並將資料一個個帶進users中
// 最後呼叫cardMode將users陣列帶進此函式中
// axios.get(indexURL).then((response) => {
//   users.push(...response.data.results);
//   cardMode(users);
// });
